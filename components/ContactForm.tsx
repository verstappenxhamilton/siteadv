import React, { useState } from "react";

const ContactForm: React.FC = () => {
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
