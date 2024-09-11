import "./Footer.css";
import logo from "build/client/assets/home-slide-1-mobile-a2161694517b4264c8960f0979553f16.png";

export function Footer() {
  return (
    <div className="footer-wrapper">
      <div className="footer-left">
        <img className="logo" alt="logo" src={logo} />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod<br></br> tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div className="footer-right">
        <div className="links">
          <ul>
            <li>
              <a>Link 01</a>
            </li>
            <li>
              <a>Link 02</a>
            </li>
            <li>
              <a>Link 03</a>
            </li>
            <li>
              <a>Link 04</a>
            </li>
          </ul>
        </div>
        <div className="policies">
          <ul>
            <li>
              <a>Privacy Policy</a>
            </li>
            <li>
              <a>Terms and Conditions</a>
            </li>
            <li>
              <a>Cookie Settings</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
