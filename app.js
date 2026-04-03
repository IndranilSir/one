document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scrolled State
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const bars = hamburger.querySelectorAll('i');
            if (navLinks.classList.contains('active')) {
                hamburger.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Close mobile menu when clicking a link
    const links = document.querySelectorAll('.nav-links li a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // 3. Scroll Reveal Animations
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100; // Trigger distance

        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    };

    // Initial check and scroll event listener
    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 5. Admission Form Handling (LocalStorage Database)
    const admissionForm = document.getElementById('admissionForm');
    if (admissionForm) {
        admissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = document.getElementById('fullName').value;
            const dob = document.getElementById('dob').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const qualification = document.getElementById('qualification').value;
            const course = document.getElementById('course').value;
            const address = document.getElementById('address').value;
            
            const formMessages = document.getElementById('formMessages');
            
            // Simple validation
            if(!fullName || !email || !phone || !course || !address) {
                formMessages.textContent = 'Please fill out all required fields.';
                formMessages.className = 'form-messages error';
                return;
            }

            // Create admission object
            const newAdmission = {
                id: Date.now().toString(),
                fullName,
                dob,
                email,
                phone,
                qualification,
                course,
                address,
                submittedAt: new Date().toISOString()
            };

            try {
                // Get existing admissions or initialize empty array
                let admissions = JSON.parse(localStorage.getItem('ikon_admissions')) || [];
                
                // Add new admission
                admissions.push(newAdmission);
                
                // Save back to LocalStorage
                localStorage.setItem('ikon_admissions', JSON.stringify(admissions));
                
                // Show success message
                formMessages.innerHTML = '<i class="fas fa-check-circle"></i> Application submitted successfully! We will contact you soon.';
                formMessages.className = 'form-messages success';
                
                // Reset form
                admissionForm.reset();
                
                // Clear message after 5 seconds
                setTimeout(() => {
                    formMessages.style.display = 'none';
                    formMessages.className = 'form-messages';
                }, 5000);
            } catch (error) {
                console.error("Error saving to database:", error);
                formMessages.textContent = 'An error occurred. Please try again later.';
                formMessages.className = 'form-messages error';
            }
        });
    }
});
