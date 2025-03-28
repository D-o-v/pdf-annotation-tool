import Link from "next/link";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className=" text-gray-800 py-8  bg-white/60">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-6">
          <Link
            href="https://www.linkedin.com/in/odunayo-dauda"
            target="_blank"
            className="hover:text-blue-500 transition-colors"
          >
            <FaLinkedin className="h-6 w-6" />
          </Link>
          <Link
            href="mailto:daudavictorodunayo@gmail.com"
            className="hover:text-blue-500 transition-colors"
          >
            <FaEnvelope className="h-6 w-6" />
          </Link>
          {/* Add GitHub link if applicable */}
          <Link
            href="https://github.com/D-o-v"
            target="_blank"
            className="hover:text-blue-500 transition-colors"
          >
            <FaGithub className="h-6 w-6" />
          </Link>
        </div>
        <p>
          © {new Date().getFullYear()} Document Signer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
