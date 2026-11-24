import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import ButtonGlow from './ui/ButtonGlow';
import { sendToFrontDesk } from '../lib/frontDesk';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function StayConnected() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  // Sends the signup through the same Web3Forms inbox as the site's other
  // forms (this form used to submit nowhere and just reload the page).
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('loading');
    setMessage('');
    const data = new FormData(form);
    data.append('access_key', '6734d3d0-0e39-4112-b5b6-3247d6699948');
    data.append('subject', 'New Newsletter Signup (Home page)');
    data.append('from_name', 'Homefront Builders Website');
    try {
      sendToFrontDesk(data, 'Stay connected signup');
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        setStatus('success');
        setMessage("You're on the list. Watch your inbox for construction updates and first looks.");
        form.reset();
      } else {
        setStatus('error');
        setMessage(json.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('A network error occurred. Please try again, or call (931) 221-2566.');
    }
  };

  return (
    <section className="py-24 bg-[#e6ecd9] border-y border-[#d4dcc0] px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-accent mb-4">Stay Connected</h2>
          <h3 className="font-serif text-4xl md:text-5xl text-primary">Join the Homefront Community.</h3>
        </motion.div>
        
        <motion.p 
          className="text-primary-light font-sans max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          Sign up to receive exclusive construction updates, local market insights, and a first look at our upcoming custom estates.
        </motion.p>

        <motion.form 
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto pt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <input 
            type="email" 
            name="email"
            autoComplete="email"
            aria-label="Email address"
            placeholder="Email Address" 
            className="flex-1 bg-white border border-gray-200 px-6 py-4 focus:outline-none focus:border-accent font-sans transition-colors"
            required
          />
          {/* Spam trap: hidden from people, filled in by bots (Web3Forms drops those). */}
          <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="bg-accent hover:bg-accent-dark text-white px-12 py-4 font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300 font-semibold btn-glow disabled:opacity-60"
          >
            <ButtonGlow />
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </motion.form>
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`min-h-[1.25rem] font-sans text-sm ${status === 'error' ? 'text-red-700' : 'text-primary'}`}
        >
          {message}
        </p>
      </div>
    </section>
  );
}
