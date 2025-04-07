import { Link } from 'wouter';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-display text-2xl font-bold mb-2">Campus Tree Explorer</h3>
            <p className="text-gray-400">Showcasing the natural beauty of our campus</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-accent transition">
              <FaFacebookF className="text-xl" />
            </a>
            <a href="#" className="hover:text-accent transition">
              <FaInstagram className="text-xl" />
            </a>
            <a href="#" className="hover:text-accent transition">
              <FaTwitter className="text-xl" />
            </a>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Campus Tree Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
