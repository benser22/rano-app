"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al enviar el mensaje");
      }

      setIsSuccess(true);
      toast.success("¡Mensaje enviado!", {
        description: "Te responderemos a la brevedad.",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error("Error al enviar", {
        description:
          error instanceof Error
            ? error.message
            : "Por favor, intentá de nuevo más tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">¡Mensaje enviado!</h3>
        <p className="text-muted-foreground">
          Gracias por contactarnos. Te responderemos pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Nombre
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2">
          Asunto
        </label>
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="¿En qué podemos ayudarte?"
          value={formData.subject}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Escribí tu mensaje..."
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
          required
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar mensaje
          </>
        )}
      </Button>
    </form>
  );
}
