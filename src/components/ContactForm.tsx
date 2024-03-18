// Make sure to run npm install @formspree/react
// For more help visit https://formspr.ee/react-help
import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import siteProperties from '../data/siteproperties.json';
import './ContactForm.css';

export default function ContactForm() {
  const formId = siteProperties.formspreeFormId;
  const [state, handleSubmit] = useForm(formId);
  if (state.succeeded) {
      return <p>Thank you for your email. I'll be in touch with you shortly!</p>;
  }

  return (
    <form className="formspree-form" onSubmit={handleSubmit}>
      <div className="formspree-field">
        <input
          className="formspree-input"
          id="email"
          type="email" 
          name="email"
          placeholder="Email Address"
        />
      </div>
      <ValidationError 
        prefix="Email" 
        field="email"
        errors={state.errors}
      />
      <div className="formspree-field">
        <textarea
          className="formspree-textarea"
          id="message"
          name="message"
          placeholder="Project description"
        />
        <div className="submit-container">
          <button className="button formspree-submit" type="submit" disabled={state.submitting}>
            Submit
          </button>
        </div>
      </div>
      <ValidationError 
        prefix="Message" 
        field="message"
        errors={state.errors}
      />
    </form>
  );
};