import { Layers } from "lucide-react";
import type { UsoSoloArea } from "@/types";
import { getCorUso } from "@/lib/map-colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UsosSoloCardProps {
  usosFiltrados: UsoSoloArea[];
  loading: boolean;
  buscaUso: string;
  setBuscaUso: (v: string) => void;
}

export function UsosSoloCard({
  usosFiltrados,
  loading,
  buscaUso,
  setBuscaUso,
}: UsosSoloCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers size={16} /> Usos do Solo
        </CardTitle>
        <Input
          placeholder="Buscar uso do solo..."
          value={buscaUso}
          onChange={(e) => setBuscaUso(e.target.value)}
          className="mt-2"
        />
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Área (m²)</TableHead>
              <TableHead className="text-right">Área (km²)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ?
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            : usosFiltrados.length === 0 ?
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum resultado para "{buscaUso}"
                </TableCell>
              </TableRow>
            : usosFiltrados.map((u) => (
                <TableRow key={u.desc_uso_solo}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCorUso(u.desc_uso_solo) }}
                      />
                      <span className="font-medium">{u.desc_uso_solo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {u.area_m2.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {u.area_km2.toLocaleString("pt-BR", {
                      minimumFractionDigits: 4,
                    })}
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
