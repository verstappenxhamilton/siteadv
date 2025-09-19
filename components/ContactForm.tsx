import React, { useState } from "react";
import type { HomeThemeOption } from "../types/home-theme";

type ContactFormProps = {
  theme: HomeThemeOption;
};

const ContactForm: React.FC<ContactFormProps> = ({ theme }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted:", formData);
    alert("Mensagem enviada com sucesso! (Simulação)");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  if (theme === "legacy") {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="legacy-name" className="sr-only">
              Nome
            </label>
            <input
              type="text"
              id="legacy-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome"
              className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="legacy-email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="legacy-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="legacy-phone" className="sr-only">
            Telefone
          </label>
          <input
            type="tel"
            id="legacy-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Telefone (Opcional)"
            className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="legacy-message" className="sr-only">
            Mensagem
          </label>
          <textarea
            id="legacy-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Mensagem"
            rows={4}
            className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-[#B98F58] text-white font-bold uppercase rounded-sm hover:bg-[#a37d4b] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#B98F58]"
        >
          Enviar Mensagem
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="contact-form__grid">
        <div className="contact-form__field">
          <label htmlFor="name" className="sr-only">
            Nome
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome"
            className="contact-form__input"
            required
          />
        </div>
        <div className="contact-form__field">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="contact-form__input"
            required
          />
        </div>
      </div>
      <div className="contact-form__field">
        <label htmlFor="phone" className="sr-only">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Telefone (Opcional)"
          className="contact-form__input"
        />
      </div>
      <div className="contact-form__field">
        <label htmlFor="message" className="sr-only">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Mensagem"
          rows={4}
          className="contact-form__textarea"
          required
        />
      </div>
      <button type="submit" className="contact-form__submit">
        Enviar mensagem
      </button>
    </form>
  );
};

export default ContactForm;
