import { motion } from 'motion/react';

export default function StayConnected() {
  return (
    <section className="py-24 bg-surface-alt border-y border-gray-100 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-accent mb-4">Stay Connected</h2>
          <h3 className="font-serif text-4xl md:text-5xl text-primary">Join the Homefront Community.</h3>
        </motion.div>
        
        <motion.p 
          className="text-primary-light font-sans max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          Sign up to receive exclusive construction updates, local market insights, and a first look at our upcoming custom estates.
        </motion.p>

        <motion.form 
          className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto pt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <input 
            type="email" 
            placeholder="Email Address" 
            className="flex-1 bg-white border border-gray-200 px-6 py-4 focus:outline-none focus:border-accent font-sans transition-colors"
            required
          />
          <button 
            type="submit"
            className="bg-accent hover:bg-accent-dark text-white px-12 py-4 font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300 font-semibold"
          >
            Subscribe
          </button>
        </motion.form>
      </div>
    </section>
  );
}
