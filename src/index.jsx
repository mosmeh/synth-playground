import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import App from './components/app';
import './style.css';

const root = document.getElementById('root');
Modal.setAppElement(root);
ReactDOM.render(<App />, root);
