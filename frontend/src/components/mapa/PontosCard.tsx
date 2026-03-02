import { Pin } from "lucide-react";
import type { PontoResponse } from "@/types";
import { getCorUso } from "@/lib/map-colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PontosCardProps {
  pontos: PontoResponse[];
  pontosFiltrados: PontoResponse[];
  usosFiltroMapa: Set<string>;
}

export function PontosCard({
  pontos,
  pontosFiltrados,
  usosFiltroMapa,
}: PontosCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Pin size={16} /> Pontos Registrados
          <Badge
            variant="secondary"
            className="ml-auto"
          >
            {pontosFiltrados.length}
            {usosFiltroMapa.size > 0 && (
              <span className="ml-1 text-muted-foreground">
                / {pontos.length}
              </span>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Uso do Solo</TableHead>
              <TableHead className="text-right">Latitude</TableHead>
              <TableHead className="text-right">Longitude</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pontosFiltrados.length === 0 ?
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  {usosFiltroMapa.size > 0 ?
                    "Nenhum ponto nas regiões selecionadas"
                  : "Nenhum ponto registrado"}
                </TableCell>
              </TableRow>
            : pontosFiltrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCorUso(p.desc_uso_solo) }}
                      />
                      <span className="font-medium">{p.desc_uso_solo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {p.latitude.toFixed(5)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {p.longitude.toFixed(5)}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
