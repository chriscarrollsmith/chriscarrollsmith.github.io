import { useForm, ValidationError } from '@formspree/react';
import siteProperties from '../data/siteproperties.json';
import './ContactForm.css';
import type { SiteProperties } from '../types/data';

const typedSiteProperties = siteProperties as SiteProperties;

const ContactForm: React.FC = () => {
  const formId = typedSiteProperties.formspreeFormId;
  const [state, handleSubmit] = useForm(formId);
  if (state.succeeded) {
      return <p>Thank you for your email. I&apos;ll be in touch with you shortly!</p>;
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
          autoComplete="email"
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
          autoComplete="off"
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

export default ContactForm;
