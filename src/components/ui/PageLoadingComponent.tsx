import React from 'react';
import styles from './PageLoadingComponent.module.css';

interface PageLoadingComponentProps {
  headerText: string;
}

export default function PageLoadingComponent({ headerText }: PageLoadingComponentProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <h1 className={styles.header}>{headerText}</h1>
      </div>
    </div>
  );
}