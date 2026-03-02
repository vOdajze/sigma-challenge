import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import { Check, X } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Usuário ou e-mail obrigatório"),
  password: z.string().min(1, "Senha obrigatória"),
});

const passwordRules = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Ao menos uma letra minúscula")
  .regex(/\d/, "Ao menos um número")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Ao menos um caractere especial");

const registerSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(100),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  password: passwordRules,
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const PASSWORD_REQUIREMENTS = [
  { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Uma letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Uma letra minúscula", test: (v: string) => /[a-z]/.test(v) },
  { label: "Um número", test: (v: string) => /\d/.test(v) },
  {
    label: "Um caractere especial",
    test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
  },
];

function PasswordRequirements({ value }: { value: string }) {
  if (!value) return null;
  return (
    <ul className="space-y-1 pt-1">
      {PASSWORD_REQUIREMENTS.map(({ label, test }) => {
        const ok = test(value);
        return (
          <li
            key={label}
            className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-muted-foreground"}`}
          >
            {ok ?
              <Check size={12} />
            : <X
                size={12}
                className="text-muted-foreground/50"
              />
            }
            {label}
          </li>
        );
      })}
    </ul>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setStatus } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = registerForm.watch("password") ?? "";

  const switchMode = (next: "login" | "register") => {
    setError(null);
    setSuccess(null);
    loginForm.reset();
    registerForm.reset();
    setMode(next);
  };

  const onLogin = async (data: LoginForm) => {
    setError(null);
    try {
      await api.post("/login", {
        identifier: data.identifier,
        password: data.password,
      });
      const { data: me } = await api.get("/me");
      setUser(me);
      setStatus("done");
      navigate("/produtos");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Usuário/e-mail ou senha inválidos.");
      } else if (err?.response?.status === 422) {
        setError("Dados inválidos. Verifique os campos.");
      } else {
        setError("Erro ao conectar. Tente novamente.");
      }
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setError(null);
    setSuccess(null);
    try {
      await api.post("/register", {
        username: data.username,
        password: data.password,
        ...(data.email ? { email: data.email } : {}),
      });
      setSuccess("Conta criada com sucesso! Faça login para continuar.");
      registerForm.reset();
      setTimeout(() => switchMode("login"), 1800);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const detail: string = err.response.data?.detail ?? "";
        if (detail.toLowerCase().includes("email")) {
          setError("Este e-mail já está em uso.");
        } else {
          setError("Este nome de usuário já está em uso.");
        }
      } else if (err?.response?.status === 422) {
        const details = err.response.data?.detail;
        if (Array.isArray(details)) {
          setError(details.map((d: any) => d.msg).join(" • "));
        } else {
          setError("Dados inválidos. Verifique os campos.");
        }
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm shadow-lg min-h-[400px] justify-center">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sigma Challenge</CardTitle>
          <CardDescription>
            {mode === "login" ?
              "Entre com suas credenciais para continuar"
            : "Crie sua conta para começar"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex rounded-md border overflow-hidden text-sm font-medium">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 transition-colors ${
                mode === "login" ?
                  "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 transition-colors ${
                mode === "register" ?
                  "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Criar conta
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 text-center">{success}</p>
          )}

          {mode === "login" && (
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="identifier">Usuário ou e-mail</Label>
                <Input
                  id="identifier"
                  placeholder="seu usuário ou e-mail"
                  autoComplete="username"
                  {...loginForm.register("identifier")}
                />
                {loginForm.formState.errors.identifier && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}

          {mode === "register" && (
            <form
              onSubmit={registerForm.handleSubmit(onRegister)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="reg-username">Usuário</Label>
                <Input
                  id="reg-username"
                  placeholder="mínimo 3 caracteres"
                  autoComplete="username"
                  {...registerForm.register("username")}
                />
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-email">
                  E-mail{" "}
                  <span className="text-xs text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-password">Senha</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...registerForm.register("password")}
                />
                <PasswordRequirements value={passwordValue} />
                {registerForm.formState.errors.password && !passwordValue && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting ?
                  "Criando conta..."
                : "Criar conta"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
