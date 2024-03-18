import './SubscribeForm.css';
import siteProperties from '../data/siteproperties.json';
import { useEffect, useState } from 'react';

const SubscribeForm = () => {
  const FORM_ID = siteProperties.convertKitFormId;
  const DATA_UID = siteProperties.convertKitDataUid;
  const [message, setMessage] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get('status');
    if (status === 'success') {
      setMessage('Success! Now check your email to confirm your subscription.');
    } else if (status === 'failure') {
      setMessage('There was an issue with your subscription. Please try again.');
    }
  }, []);
  
  return(
    <div className='convertkit-form' id="subscribe">
      <div className="title-section">
        <h3>Subscribe for email updates</h3>
      </div>
      <div className="body-section">
      <script src="https://f.convertkit.com/ckjs/ck.5.js"></script>
      <form action={`https://app.convertkit.com/forms/${FORM_ID}/subscriptions`} className="seva-form formkit-form" method="post" data-sv-form={FORM_ID} data-uid={DATA_UID} data-format="inline" data-version="5" data-options="{&quot;settings&quot;:{&quot;after_subscribe&quot;:{&quot;action&quot;:&quot;message&quot;,&quot;success_message&quot;:&quot;Success! Now check your email to confirm your subscription.&quot;,&quot;redirect_url&quot;:&quot;&quot;},&quot;analytics&quot;:{&quot;google&quot;:null,&quot;fathom&quot;:null,&quot;facebook&quot;:null,&quot;segment&quot;:null,&quot;pinterest&quot;:null,&quot;sparkloop&quot;:null,&quot;googletagmanager&quot;:null},&quot;modal&quot;:{&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15},&quot;powered_by&quot;:{&quot;show&quot;:true,&quot;url&quot;:&quot;https://convertkit.com/features/forms?utm_campaign=poweredby&amp;utm_content=form&amp;utm_medium=referral&amp;utm_source=dynamic&quot;},&quot;recaptcha&quot;:{&quot;enabled&quot;:false},&quot;return_visitor&quot;:{&quot;action&quot;:&quot;show&quot;,&quot;custom_content&quot;:&quot;&quot;},&quot;slide_in&quot;:{&quot;display_in&quot;:&quot;bottom_right&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15},&quot;sticky_bar&quot;:{&quot;display_in&quot;:&quot;top&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15}},&quot;version&quot;:&quot;5&quot;}" min-width="400 500 600 700 800">
        <div data-style="clean">
          <ul className="formkit-alert formkit-alert-error" data-element="errors" data-group="alert">
          </ul>
          <div data-element="fields" data-stacked="false" className="seva-fields formkit-fields">
            <div className="formkit-field">
              <input className="formkit-input" name="fields[name]" aria-label="Name" placeholder="Name" type="text" />
            </div>
            <div className="formkit-field">
              <input className="formkit-input" name="email_address" aria-label="Email Address" placeholder="Email Address" required type="email" />
            </div>
            <button data-element="submit" className="formkit-submit">
              <div className="formkit-spinner">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span>Subscribe</span>
            </button>
            {message && <div>{message}</div>}
          </div>
        </div>
      </form>
      </div>
    </div>
  );
};

export default SubscribeForm;