"use client";
import Link from "next/link";



const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <h1>Welcome to My Project</h1>
      <p>Developed by <strong>Shlok Jayesh Patel</strong></p>

      {/* LinkedIn Profile */}
      <p>
        Connect with me on LinkedIn:{" "}
        <a 
          href="https://www.linkedin.com/in/shlokpatel140202/"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin-link"
        >
          Click Here
        </a>
      </p>

      {/* Navigate to Translator Page */}
      <Link href="/NaoTranslate">
        <button className="translate-button">Go to NaoTranslate</button>
      </Link>
    </div>
  );
};

export default HomePage;
