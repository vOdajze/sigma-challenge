import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { Produto } from "@/types";
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

interface ProdutosTableProps {
  produtos: Produto[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  PAGE_SIZE: number;
  hasAnyFilter: boolean;
  onEdit: (produto: Produto) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

export function ProdutosTable({
  produtos,
  loading,
  page,
  totalPages,
  totalItems,
  PAGE_SIZE,
  hasAnyFilter,
  onEdit,
  onDelete,
  onPageChange,
}: ProdutosTableProps) {
  return (
    <div className="rounded-md border">
      <div className="min-h-[480px] px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ?
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-10"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            : produtos.length === 0 ?
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-10"
                >
                  {hasAnyFilter ?
                    "Nenhum produto encontrado com esses filtros"
                  : "Nenhum produto cadastrado"}
                </TableCell>
              </TableRow>
            : produtos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground max-w-sm truncate">
                    {p.descricao ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {p.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        p.quantidade_estoque > 0 ? "default" : "destructive"
                      }
                    >
                      {p.quantidade_estoque}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(p)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(p.id)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
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
            `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalItems)} de ${totalItems} produto${totalItems !== 1 ? "s" : ""}`
          : hasAnyFilter ?
            "Nenhum resultado"
          : "Nenhum produto"}
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
