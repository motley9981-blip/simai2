// ===========================
// State Management
// ===========================
let currentMonth = new Date();
let selectedDate = null;
let selectedTimeSlot = null;

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
    initializeFormHandlers();
    initializeAnimations();
});

// ===========================
// Calendar Functions
// ===========================
function initializeCalendar() {
    renderCalendar();

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });
}

function renderCalendar() {
    const monthDisplay = document.getElementById('calendarMonth');
    const daysContainer = document.getElementById('calendarDays');

    // Update month display
    const options = { year: 'numeric', month: 'long' };
    monthDisplay.textContent = currentMonth.toLocaleDateString('ko-KR', options);

    // Clear previous days
    daysContainer.innerHTML = '';

    // Get calendar information
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Number of days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add previous month's trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const prevMonthDay = daysInPrevMonth - i;
        const dayElement = createDayElement(prevMonthDay, true, true);
        daysContainer.appendChild(dayElement);
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const isDisabled = date < today;
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

        const dayElement = createDayElement(day, false, isDisabled, isToday, date, isSelected);
        daysContainer.appendChild(dayElement);
    }

    // Add next month's leading days to complete the grid
    const totalCellsUsed = firstDayOfMonth + daysInMonth;
    const remainingCells = Math.ceil(totalCellsUsed / 7) * 7 - totalCellsUsed;

    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, true);
        daysContainer.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth, isDisabled, isToday = false, date = null, isSelected = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    if (isDisabled) {
        dayElement.classList.add('disabled');
    }

    if (isToday) {
        dayElement.classList.add('today');
    }

    if (isSelected) {
        dayElement.classList.add('selected');
    }

    if (!isOtherMonth && !isDisabled && date) {
        dayElement.addEventListener('click', () => selectDate(date));
    }

    return dayElement;
}

function selectDate(date) {
    selectedDate = date;

    // Re-render calendar to update selected state
    renderCalendar();

    // Update selected date display
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const formattedDate = date.toLocaleDateString('ko-KR', options);
    document.getElementById('selectedDateDisplay').textContent = formattedDate;

    // Update form date input
    const dateInput = document.getElementById('date');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;

    // Update time slots
    updateTimeSlots();
}

function updateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';

    if (!selectedDate) {
        timeSlotsContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-md);">날짜를 먼저 선택해주세요</p>';
        return;
    }

    const timeSlots = [
        { time: '11:30', status: 'available' },
        { time: '12:00', status: 'limited' },
        { time: '12:30', status: 'available' },
        { time: '13:00', status: 'full' },
        { time: '17:30', status: 'available' },
        { time: '18:00', status: 'available' },
        { time: '18:30', status: 'limited' },
        { time: '19:00', status: 'available' },
        { time: '19:30', status: 'full' },
        { time: '20:00', status: 'available' },
    ];

    timeSlots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = `time-slot ${slot.status}`;
        slotElement.textContent = slot.time;

        if (slot.status !== 'full') {
            slotElement.addEventListener('click', () => selectTimeSlot(slot.time, slotElement));
        }

        timeSlotsContainer.appendChild(slotElement);
    });
}

function selectTimeSlot(time, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.style.background = '';
        slot.style.color = '';
        slot.style.borderColor = '';
    });

    // Highlight selected slot
    element.style.background = 'var(--color-primary)';
    element.style.color = 'var(--color-bg-dark)';
    element.style.borderColor = 'var(--color-primary)';

    selectedTimeSlot = time;

    // Update form time input
    document.getElementById('time').value = time;

    // Smooth scroll to form
    document.querySelector('.reservation-form').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });
}

// ===========================
// Form Handlers
// ===========================
function initializeFormHandlers() {
    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', handleFormSubmit);

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 3 && value.length <= 7) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length > 7) {
            value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
        e.target.value = value;
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('.submit-button');

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    // Collect form data
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        guests: document.getElementById('guests').value,
        requests: document.getElementById('requests').value,
        marketing: document.getElementById('marketing').checked
    };

    // Simulate API call
    await simulateReservation(formData);

    // Reset loading state
    submitButton.classList.remove('loading');
    submitButton.disabled = false;

    // Show success modal
    showSuccessModal(formData);

    // Reset form
    e.target.reset();
    document.getElementById('guests').value = 2;
    selectedTimeSlot = null;
    selectedDate = null;

    // Reset selections
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.style.background = '';
        slot.style.color = '';
        slot.style.borderColor = '';
    });

    document.getElementById('selectedDateDisplay').textContent = '날짜를 선택해주세요';
    renderCalendar();
    updateTimeSlots();
}

function simulateReservation(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Reservation data:', data);
            resolve();
        }, 1500);
    });
}

// ===========================
// Guest Counter
// ===========================
function changeGuests(delta) {
    const guestInput = document.getElementById('guests');
    let currentValue = parseInt(guestInput.value);
    let newValue = currentValue + delta;

    // Clamp between 1 and 10
    newValue = Math.max(1, Math.min(10, newValue));

    guestInput.value = newValue;

    // Add animation
    guestInput.style.transform = 'scale(1.1)';
    setTimeout(() => {
        guestInput.style.transform = 'scale(1)';
    }, 200);
}

// ===========================
// Modal Functions
// ===========================
function showSuccessModal(data) {
    const modal = document.getElementById('successModal');
    const modalDetails = document.getElementById('modalDetails');

    // Format date
    const dateObj = new Date(data.date);
    const formattedDate = dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    modalDetails.innerHTML = `
        <p><strong>예약자:</strong> ${data.name}</p>
        <p><strong>연락처:</strong> ${data.phone}</p>
        <p><strong>날짜:</strong> ${formattedDate}</p>
        <p><strong>시간:</strong> ${data.time}</p>
        <p><strong>인원:</strong> ${data.guests}명</p>
        ${data.requests ? `<p><strong>요청사항:</strong> ${data.requests}</p>` : ''}
    `;

    modal.classList.add('active');

    // Send analytics event (in production)
    trackReservation(data);
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ===========================
// Scroll Functions
// ===========================
function scrollToReservation() {
    const reservationSection = document.getElementById('reservation');
    reservationSection.scrollIntoView({ behavior: 'smooth' });

    // Add attention animation to form
    const form = document.querySelector('.reservation-form-panel');
    form.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
}

// ===========================
// External Links
// ===========================
function openMap() {
    // Updated address for Daegu
    const address = encodeURIComponent('대구시 수성구 동대구로 383, 5층');
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
}

// ===========================
// Animations
// ===========================
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('.features, .gallery, .reservation, .info').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Parallax effect for hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ===========================
// Analytics (Placeholder)
// ===========================
function trackReservation(data) {
    console.log('Track reservation:', data);
}

// ===========================
// Keyboard Shortcuts
// ===========================
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeModal();
    }

    // Ctrl/Cmd + K to focus reservation
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        scrollToReservation();
    }
});

// ===========================
// Local Storage for Draft Reservations
// ===========================
function saveDraft() {
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        guests: document.getElementById('guests').value,
        requests: document.getElementById('requests').value,
    };

    localStorage.setItem('reservationDraft', JSON.stringify(formData));
}

function loadDraft() {
    const draft = localStorage.getItem('reservationDraft');
    if (draft) {
        const data = JSON.parse(draft);
        document.getElementById('name').value = data.name || '';
        document.getElementById('phone').value = data.phone || '';
        if (data.date) {
            document.getElementById('date').value = data.date;
        }
        if (data.time) {
            document.getElementById('time').value = data.time;
        }
        document.getElementById('guests').value = data.guests || 2;
        document.getElementById('requests').value = data.requests || '';
    }
}

// Auto-save draft every 5 seconds
setInterval(() => {
    const form = document.getElementById('reservationForm');
    if (form && (form.querySelector('input').value || form.querySelector('textarea').value)) {
        saveDraft();
    }
}, 5000);

// Load draft on page load
window.addEventListener('load', loadDraft);
