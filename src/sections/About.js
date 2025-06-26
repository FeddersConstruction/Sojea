// src/components/About.js
import React, { useRef, useEffect } from 'react';
import AboutImg from '../assets/img/About.png';
import '../styles/About.css';

export default function About() {
	const textRef = useRef(null);

	useEffect(() => {
		const el = textRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry], obs) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('fade-up-active');
					obs.unobserve(entry.target);  // only run once
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<section id="about" className="about-container">
			<div ref={textRef} className="about-text fade-up">
				<p className="about-title">About Us</p>
				<p className="about-body">
					&emsp;Hey! I’m Wade Fedders, a 17-year-old from Fort Thomas, KY, and a student at Highlands High School. I started Sójea because I wanted to bring something real to my community—a drink that could be both healthy and refreshing.
				</p>

				<p className="about-body">
					&emsp;This idea was sparked during a vacation in Spain. I’d tasted a glass of fresh orange juice that completely changed the way I viewed fruit juice. No added sugar, no preservatives—just pure, natural flavor. That moment made me realize how much we’re missing out on back home, and I knew I had to bring that same delicious, tangy experience to my local community in Fort Thomas.
				</p>
			</div>
			<div className="about-image">
				<img src={AboutImg} alt="About us" />
			</div>
		</section>
	);
}
