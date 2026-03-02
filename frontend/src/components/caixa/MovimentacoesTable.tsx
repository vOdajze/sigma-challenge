import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Movimentacao, Produto } from "@/types";
import { formatBRL, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MovimentacoesTableProps {
  movimentacoes: Movimentacao[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  PAGE_SIZE: number;
  hasActiveFilters: boolean;
  produtos: Produto[];
  onPageChange: (page: number) => void;
}

export function MovimentacoesTable({
  movimentacoes,
  loading,
  page,
  totalPages,
  totalItems,
  PAGE_SIZE,
  hasActiveFilters,
  produtos,
  onPageChange,
}: MovimentacoesTableProps) {
  return (
    <div className="rounded-md border">
      <div className="min-h-[480px] px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ?
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-10"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            : movimentacoes.length === 0 ?
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-10"
                >
                  {hasActiveFilters ?
                    "Nenhuma movimentação encontrada com esses filtros"
                  : "Nenhuma movimentação registrada"}
                </TableCell>
              </TableRow>
            : movimentacoes.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {produtos.find((p) => p.id === m.produto_id)?.nome ??
                      `Produto #${m.produto_id}`}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        m.tipo_movimentacao === "entrada" ?
                          "default"
                        : "destructive"
                      }
                    >
                      {m.tipo_movimentacao === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{m.quantidade}</TableCell>
                  <TableCell className="text-right">
                    {formatBRL(m.valor_unitario)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBRL(m.valor_total)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {formatDate(m.data_movimentacao)}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t">
        <span className="text-sm text-muted-foreground">
          {totalItems > 0 ?
            `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalItems)} de ${totalItems} movimentaç${totalItems !== 1 ? "ões" : "ão"}`
          : hasActiveFilters ?
            "Nenhum resultado"
          : "Nenhuma movimentação"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Página {page} de {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
