"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, signup } from "./actions";
import {
  type LoginFormData,
  loginSchema,
  type SignupFormData,
  signupSchema,
} from "./schemas";

export default function LoginPage() {
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userType: "freelancer",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await login(formData);

      if (result?.error) {
        loginForm.setError("root", {
          type: "manual",
          message: result.error,
        });
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      loginForm.setError("root", {
        type: "manual",
        message: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("userType", data.userType);

      const result = await signup(formData);

      if (result?.error) {
        signupForm.setError("root", {
          type: "manual",
          message: result.error,
        });
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      signupForm.setError("root", {
        type: "manual",
        message: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais ou crie uma nova conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Login Form */}
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <FieldGroup>
                    <Controller
                      name="email"
                      control={loginForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="login-email">Email:</FieldLabel>
                          <Input
                            {...field}
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="password"
                      control={loginForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="login-password">
                            Senha:
                          </FieldLabel>
                          <Input
                            {...field}
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {loginForm.formState.errors.root && (
                      <div className="rounded-md bg-red-50 p-3 border border-red-200">
                        <p className="text-sm text-red-800">
                          {loginForm.formState.errors.root.message}
                        </p>
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Entrar
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Entre com suas credenciais ou crie uma nova conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Signup Form */}
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                  <FieldGroup>
                    <Controller
                      name="name"
                      control={signupForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="signup-name">Nome:</FieldLabel>
                          <Input
                            {...field}
                            id="signup-name"
                            type="text"
                            placeholder="Seu nome completo"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="email"
                      control={signupForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="signup-email">Email:</FieldLabel>
                          <Input
                            {...field}
                            id="signup-email"
                            type="email"
                            placeholder="seu@email.com"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="password"
                      control={signupForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="signup-password">
                            Senha:
                          </FieldLabel>
                          <Input
                            {...field}
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="userType"
                      control={signupForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>
                            Qual seu objetivo na plataforma?
                          </FieldLabel>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant={
                                field.value === "freelancer"
                                  ? "default"
                                  : "outline"
                              }
                              className="flex-1"
                              onClick={() => field.onChange("freelancer")}
                            >
                              Sou Prestador de Serviço
                            </Button>
                            <Button
                              type="button"
                              variant={
                                field.value === "contractor"
                                  ? "default"
                                  : "outline"
                              }
                              className="flex-1"
                              onClick={() => field.onChange("contractor")}
                            >
                              Quero Contratar
                            </Button>
                          </div>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {signupForm.formState.errors.root && (
                      <div className="rounded-md bg-red-50 p-3 border border-red-200">
                        <p className="text-sm text-red-800">
                          {signupForm.formState.errors.root.message}
                        </p>
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Criar Conta
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
