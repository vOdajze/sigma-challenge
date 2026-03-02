import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const pontoSchema = z.object({
  latitude: z.number({ message: "Latitude inválida" }).min(-90).max(90),
  longitude: z.number({ message: "Longitude inválida" }).min(-180).max(180),
});

type PontoForm = z.infer<typeof pontoSchema>;

interface PontoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoords: { lat: number; lng: number } | null;
  onSuccess: () => void;
}

export function PontoDialog({
  open,
  onOpenChange,
  initialCoords,
  onSuccess,
}: PontoDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PontoForm>({
    resolver: zodResolver(pontoSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        initialCoords ?
          { latitude: initialCoords.lat, longitude: initialCoords.lng }
        : {},
      );
    }
  }, [open, initialCoords, reset]);

  const onSubmit = async (form: PontoForm) => {
    try {
      await api.post("/gis/pontos", form);
      toast.success("Ponto registrado com sucesso");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail ?? "Erro ao registrar ponto");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Ponto de Amostragem</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 pt-2"
        >
          <p className="text-sm text-muted-foreground">
            O uso do solo será identificado automaticamente pelas coordenadas.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="-21.176700"
                {...register("latitude", { valueAsNumber: true })}
              />
              {errors.latitude && (
                <p className="text-sm text-destructive">
                  {errors.latitude.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="-47.820800"
                {...register("longitude", { valueAsNumber: true })}
              />
              {errors.longitude && (
                <p className="text-sm text-destructive">
                  {errors.longitude.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
