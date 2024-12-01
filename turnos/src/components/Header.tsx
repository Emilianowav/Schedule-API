import Image from "next/image";
import styles from './Header.module.css';
import logo from "../../public/images/ioscorLogo.svg";
import logo2 from "../../public/images/poliLogo.png";

const Header: React.FC = () => {
    return (
        <div className={styles.header}>
            <Image src={logo} width={175} height={150} alt="logo" />
            <Image src={logo2} width={300} height={20} alt="logo" />
        </div>
    );
};

export default Header;
