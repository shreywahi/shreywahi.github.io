import { useRef } from 'react';
import emailjs from '@emailjs/browser';

const Email = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    const name = form.current.querySelector('input[name="name"]').value.trim();
    const email = form.current.querySelector('input[name="email"]').value.trim();
    const number = form.current.querySelector('input[name="number"]').value.trim();
    const message = form.current.querySelector('textarea[name="message"]').value.trim();

    // Phone number validation: only digits, optional + at start, 7-15 digits
    const phoneValid = number === "" || /^\+?\d{7,15}$/.test(number);

    // At least one of email or phone must be filled
    if (!name || !message || (!email && !number)) {
      alert("Please fill out your name and the message you want to send with at least one contact info.");
      return;
    }

    if (!phoneValid) {
      alert("Please enter a valid phone number (digits only, 7-15 characters).");
      return;
    }

    // Set the time input value to current time before sending
    const timeInput = form.current.querySelector('input[name="time"]');
    if (timeInput) {
      timeInput.value = new Date().toLocaleString();
    }

    emailjs.sendForm('service_1zmivyt', 'template_o5oexfe', form.current, '1HA7VZDfP_0OwENgH')
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
  };

  return (
    <form
      ref={form}
      onSubmit={sendEmail}
      className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-4 sm:p-6 mb-10 max-w-md mx-auto flex flex-col gap-4"
    >
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="name">Name</label>
          <input
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:bg-gray-800 dark:text-white transition"
            type="text"
            name="name"
            id="name"
            required
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="number">Phone No</label>
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
        <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="email">Email</label>
        <input
          className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:bg-gray-800 dark:text-white transition"
          type="email"
          name="email"
          id="email"
        />
      </div>
      <input type="hidden" name="time" />
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-gray-700 dark:text-gray-200" htmlFor="message">Message</label>
        <textarea
          className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:bg-gray-800 dark:text-white transition resize-none min-h-[80px]"
          name="message"
          id="message"
          required
        />
      </div>
      <input
        type="submit"
        value="Send"
        className="mt-2 bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </form>
  );
};

export default Email;