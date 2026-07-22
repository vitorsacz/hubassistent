import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import type { ParsedInvoiceItem, ParsedInvoicePreview } from "@hubassistent/shared-types";

const MONTHS_PT: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  março: 2,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

const EXTRACTION_PROMPT = `Você é um extrator de dados financeiros de alta precisão.
Analise o texto da fatura de cartão de crédito de qualquer banco e extraia as informações no formato JSON.

Regras estritas:
1. Ignore pagamentos da fatura anterior, créditos de estorno na listagem principal e taxas/impostos (ex: IOF).
2. Identifique o nome do banco emissor de forma clara e limpa (ex: "Bradesco", "Nubank", "Itaú", "Inter"). Não inclua "S.A." ou complementos.
3. Identifique o mês e o ano de referência da fatura — o período de gastos que ela cobre. Procure primeiro por um texto explícito no documento (ex: "Fatura de julho", "Referente a junho/2026", período "DD/MM a DD/MM"). Só se não houver texto explícito, infira que é o mês anterior ao do vencimento (ex: vencimento em agosto costuma corresponder à fatura de julho). O mês deve ser por extenso em português e minúsculo (ex: "janeiro", "junho") e o ano com 4 dígitos (ex: 2026).
4. Identifique a data de vencimento da fatura no formato DD/MM/AAAA.
5. Identifique o valor total final da fatura.
6. Para compras parceladas, extraia o nome do estabelecimento limpo e coloque a parcela no campo correspondente (ex: "01/02").

Estrutura exata do JSON de saída:
{
  "banco": "Nome do Banco",
  "mes_fatura": "junho",
  "ano_fatura": 2026,
  "vencimento": "DD/MM/AAAA",
  "valor_total": 0000.00,
  "transacoes": [
    {
      "data": "DD/MM",
      "estabelecimento": "NOME DO ESTABELECIMENTO",
      "valor": 00.00,
      "tipo": "Parcelado ou Normal",
      "parcela": "X/Y ou -"
    }
  ]
}

Texto bruto da fatura:
`;

interface GeminiInvoiceItem {
  data?: string;
  estabelecimento?: string;
  valor?: number;
  parcela?: string;
}

interface GeminiInvoiceResponse {
  banco?: string;
  mes_fatura?: string;
  ano_fatura?: number;
  vencimento?: string;
  transacoes?: GeminiInvoiceItem[];
}

function parseDueDate(value: string | undefined): Date | null {
  const match = value?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  return new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
}

function parseReferenceMonth(month: string | undefined, year: number | undefined): Date | null {
  if (!month || !year) return null;
  const monthIndex = MONTHS_PT[month.toLowerCase()];
  if (monthIndex === undefined) return null;
  return new Date(Date.UTC(year, monthIndex, 1));
}

function mapItem(item: GeminiInvoiceItem, year: number | undefined): ParsedInvoiceItem | null {
  const dateMatch = item.data?.match(/^(\d{2})\/(\d{2})$/);
  if (!dateMatch?.[1] || !dateMatch[2] || !item.estabelecimento || typeof item.valor !== "number") {
    return null;
  }

  const date = new Date(Date.UTC(year ?? new Date().getUTCFullYear(), Number(dateMatch[2]) - 1, Number(dateMatch[1])));

  let installmentNumber: number | undefined;
  let installmentTotal: number | undefined;
  const parcelaMatch = item.parcela?.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (parcelaMatch?.[1] && parcelaMatch[2]) {
    installmentNumber = Number(parcelaMatch[1]);
    installmentTotal = Number(parcelaMatch[2]);
  }

  return {
    date,
    description: item.estabelecimento,
    amount: item.valor,
    installmentNumber,
    installmentTotal,
  };
}

@Injectable()
export class InvoicePdfParserService {
  private readonly client: GoogleGenAI;

  constructor(config: ConfigService) {
    this.client = new GoogleGenAI({ apiKey: config.getOrThrow<string>("GEMINI_API_KEY") });
  }

  async parse(buffer: Buffer): Promise<ParsedInvoicePreview> {
    const text = await this.extractText(buffer);
    const data = await this.extractWithGemini(text);

    return {
      referenceMonth: parseReferenceMonth(data.mes_fatura, data.ano_fatura),
      dueDate: parseDueDate(data.vencimento),
      bank: data.banco ?? null,
      items: (data.transacoes ?? [])
        .map((item) => mapItem(item, data.ano_fatura))
        .filter((item): item is ParsedInvoiceItem => item !== null),
    };
  }

  private async extractText(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  private async extractWithGemini(rawText: string): Promise<GeminiInvoiceResponse> {
    const response = await this.client.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: EXTRACTION_PROMPT + rawText,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new BadGatewayException("A IA não retornou dados da fatura");
    }

    try {
      return JSON.parse(response.text) as GeminiInvoiceResponse;
    } catch {
      throw new BadGatewayException("Não foi possível interpretar a resposta da IA");
    }
  }
}
