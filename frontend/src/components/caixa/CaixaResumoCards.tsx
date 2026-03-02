import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { CaixaResumo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/formatters";

interface CaixaResumoCardsProps {
  resumo: CaixaResumo | null;
  loading: boolean;
}

export function CaixaResumoCards({ resumo, loading }: CaixaResumoCardsProps) {
  const saldoPositivo = (resumo?.saldo ?? 0) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Entradas
          </CardTitle>
          <TrendingUp
            size={18}
            className="text-green-500"
          />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            {loading ? "—" : formatBRL(resumo?.total_entradas ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Saídas
          </CardTitle>
          <TrendingDown
            size={18}
            className="text-red-500"
          />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">
            {loading ? "—" : formatBRL(resumo?.total_saidas ?? 0)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo
          </CardTitle>
          <Wallet
            size={18}
            className={saldoPositivo ? "text-green-500" : "text-red-500"}
          />
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${saldoPositivo ? "text-green-600" : "text-red-500"}`}
          >
            {loading ? "—" : formatBRL(resumo?.saldo ?? 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
