import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import toast, { Toaster } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

const RECAPTCHA_SITE_KEY = "6Le5-lorAAAAAIkSmCTQyDM7dJaSYUV98hKRtBZT";

const Email = () => {
  const form = useRef();
  const [formMessage, setFormMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const setFocus = (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  };

  const validateFields = ({ name, email, number, message }) => {
    if (!name && !email && !number && !message) {
      return {
        message: "Enter your name and message along with email or number.",
        focus: 'input[name="name"]'
      };
    }
    if (!name) {
      return {
        message: "Hi, enter your name.",
        focus: 'input[name="name"]'
      };
    }
    if (!message) {
      if (email || number) {
        return {
          message: `Hi ${name}, enter your message.`,
          focus: 'textarea[name="message"]'
        };
      }
      return {
        message: `Hi ${name}, enter your message and share your contact information.`,
        focus: 'textarea[name="message"]'
      };
    }
    if (!email && !number) {
      return {
        message: `Hi ${name}, share your contact information!`,
        focus: 'input[name="email"]'
      };
    }
    if (number && !PHONE_PATTERN.test(number)) {
      return {
        message: `Hi ${name}, please enter a valid phone number (7-15 digits, optional + at start).`,
        focus: 'input[name="number"]'
      };
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return {
        message: `Hi ${name}, please enter a valid email address.`,
        focus: 'input[name="email"]'
      };
    }
    return null;
  };

  const sendEmail = (e) => {
    e.preventDefault();

    const name = form.current.querySelector('input[name="name"]').value.trim();
    const email = form.current.querySelector('input[name="email"]').value.trim();
    const number = form.current.querySelector('input[name="number"]').value.trim();
    const message = form.current.querySelector('textarea[name="message"]').value.trim();

    const validation = validateFields({ name, email, number, message });
    if (validation) {
      setFormMessage(validation.message);
      setFocus(form.current.querySelector(validation.focus));
      return;
    }

    // Set the time input value to current time before sending
    const timeInput = form.current.querySelector('input[name="time"]');
    if (timeInput) {
      timeInput.value = new Date().toLocaleString();
    }

    if (!captchaToken) {
      setFormMessage("Please complete the CAPTCHA.");
      return;
    }

    emailjs.sendForm('service_1zmivyt', 'template_o5oexfe', form.current, '1HA7VZDfP_0OwENgH')
      .then(() => {
        form.current.reset();
        setFormMessage("");
        toast.success('Your message has been sent successfully!');
      }, (error) => {
        console.log(error.text);
        setFormMessage("");
        toast.error('Failed to send message.');
      });
  };

  return (
    <>
      <Toaster position="top-center" />
      <form
        ref={form}
        onSubmit={sendEmail}
        noValidate
        autoComplete="off"
        aria-label="Contact Form"
        className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-4 sm:p-6 mb-8 max-w-xs sm:max-w-md mx-auto flex flex-col gap-4"
      >
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="name">Name</label>
            <input
              className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:bg-gray-800 dark:text-white transition"
              type="text"
              name="name"
              id="name"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="number">Phone Number</label>
            <input
              className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:bg-gray-800 dark:text-white transition"
              type="tel"
              name="number"
              id="number"
              pattern="^\+?\d{7,15}$"
              inputMode="numeric"
              title="Phone number should be 7-15 digits, digits only, optional + at start"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="email">Email Address</label>
          <input
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:bg-gray-800 dark:text-white transition"
            type="email"
            name="email"
            id="email"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="message">Message</label>
          <textarea
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:bg-gray-800 dark:text-white transition resize-none min-h-[80px]"
            name="message"
            id="message"
          />
        </div>
        <input type="hidden" name="time" />
        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={token => setCaptchaToken(token)}
            theme="light"
          />
        </div>
        {formMessage && (
          <div className="text-red-600 font-medium text-sm mb-2 text-center">{formMessage}</div>
        )}
        <input
          type="submit"
          value="Send Message"
          className="mt-2 bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </form>
    </>
  );
};

export default Email;