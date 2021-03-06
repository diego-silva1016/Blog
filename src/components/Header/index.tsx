import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div className={styles.header}>
        <Link href="/">
          <img src="/images/Logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
}
