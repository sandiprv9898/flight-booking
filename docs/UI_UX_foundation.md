# ✈️ Flight Booking Platform — UI/UX & Frontend Architecture (Vue 3 + Pinia)

## 🎨 UI/UX Guidelines

### General Rules
- Use **Vue 3 (Composition API)** + **Pinia** for state management.
- Keep components **modular, reusable, and atomic**.
- Follow **TailwindCSS** for styling with utility-first classes.
- Apply **responsive design** → mobile-first, then expand for tablet & desktop.
- Use **lazy loading** and **code-splitting** for large components like `SeatMap`.
- Each step in the booking flow should be **clear and guided with breadcrumbs/progress bar**.
- Always keep **Price Summary Sidebar** visible (fixed on desktop, collapsible on mobile).

### Multi-step Flow (UI/UX)
1. **Search Flights**
   - Form with `From`, `To`, `Date`, `Passengers`.
   - Auto-suggestions for airports (autocomplete).
   - One-way & round-trip toggle.

2. **Flight Listing**
   - Sort by: Price, Duration, Departure Time.
   - Filters: Airlines, Stops, Price Range.
   - Card-based results with key details.

3. **Seat Selection**
   - Visual seat map (interactive).
   - Hover → show seat price & availability.
   - Different colors for Economy, Business, Premium.
   - Dynamic pricing based on seat selection.

4. **Passenger Details**
   - Dynamic form for multiple passengers.
   - Reusable components for input fields.
   - Passport/ID validation (UI only, backend handles logic).

5. **Payment**
   - Show final breakdown of fare + taxes + seat price.
   - Multiple payment methods UI (Cards, UPI, Wallets).
   - Progress spinner during confirmation.

6. **Booking Confirmation**
   - Show booking reference ID & ticket summary.
   - Download/Print ticket button.
   - Email confirmation (backend-driven).

---

## 📂 Suggested Folder Structure (Vue 3 + Pinia)

```
src/
├── assets/                # Images, icons, global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Select.vue
│   │   ├── Modal.vue
│   │   └── Stepper.vue
│   ├── booking/           # Flight booking flow components
│   │   ├── SearchForm.vue
│   │   ├── FlightCard.vue
│   │   ├── SeatMap.vue
│   │   ├── PassengerForm.vue
│   │   ├── PriceSummary.vue
│   │   └── PaymentForm.vue
│   └── layout/
│       ├── Navbar.vue
│       ├── Footer.vue
│       └── SidebarSummary.vue
├── layouts/
│   ├── DefaultLayout.vue
│   └── BookingLayout.vue
├── pages/
│   ├── Home.vue
│   ├── Booking.vue
│   ├── Confirmation.vue
│   └── NotFound.vue
├── store/                 # Pinia Stores
│   ├── booking.js
│   ├── user.js
│   └── seat.js
├── utils/                 # Helper functions
│   ├── price.js
│   └── validators.js
├── App.vue
├── main.js
└── router.js
```

---

## 🗂 Pinia Store Rules (with Examples)

### `store/booking.js`
```js
import { defineStore } from 'pinia'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    searchCriteria: {},
    selectedFlight: null,
    passengers: [],
    seats: [],
    payment: {}
  }),
  actions: {
    setSearchCriteria(criteria) {
      this.searchCriteria = criteria
    },
    selectFlight(flight) {
      this.selectedFlight = flight
    },
    addPassenger(passenger) {
      this.passengers.push(passenger)
    },
    selectSeat(seat) {
      this.seats.push(seat)
    },
    setPayment(payment) {
      this.payment = payment
    }
  },
  getters: {
    totalPrice: (state) => {
      let seatCost = state.seats.reduce((sum, seat) => sum + seat.price, 0)
      return (state.selectedFlight?.basePrice || 0) + seatCost
    }
  }
})
```

---

## 🧩 Example Component Boilerplates

### `SeatMap.vue`
```vue
<template>
  <div class="grid grid-cols-6 gap-2 p-4">
    <div
      v-for="seat in seats"
      :key="seat.id"
      :class="[
        'w-10 h-10 flex items-center justify-center rounded cursor-pointer',
        seat.isBooked ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-400 hover:bg-green-500',
        selectedSeats.includes(seat.id) ? 'bg-blue-500 text-white' : ''
      ]"
      @click="toggleSeat(seat)"
    >
      {{ seat.label }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBookingStore } from '@/store/booking'

const bookingStore = useBookingStore()
const seats = ref([
  { id: 1, label: '1A', price: 500, isBooked: false },
  { id: 2, label: '1B', price: 600, isBooked: true },
  { id: 3, label: '1C', price: 550, isBooked: false }
])

const selectedSeats = ref([])

function toggleSeat(seat) {
  if (seat.isBooked) return
  if (selectedSeats.value.includes(seat.id)) {
    selectedSeats.value = selectedSeats.value.filter((id) => id !== seat.id)
  } else {
    selectedSeats.value.push(seat.id)
    bookingStore.selectSeat(seat)
  }
}
</script>
```

### `PriceSummary.vue`
```vue
<template>
  <aside class="p-4 bg-gray-50 rounded-lg shadow-md sticky top-4">
    <h2 class="text-lg font-semibold mb-3">Price Summary</h2>
    <ul>
      <li>Base Fare: {{ booking.selectedFlight?.basePrice || 0 }}</li>
      <li>Seats: {{ booking.seats.reduce((s, seat) => s + seat.price, 0) }}</li>
      <li class="font-bold">Total: {{ booking.totalPrice }}</li>
    </ul>
  </aside>
</template>

<script setup>
import { useBookingStore } from '@/store/booking'
const booking = useBookingStore()
</script>
```

---

## ✅ Next Steps
- Create **wireframes** for each step.
- Implement **dummy JSON** for flight/seat data before backend integration.
- Add **unit tests** for Pinia store and UI components.
- Later integrate **Laravel API** for flights, booking, and payments.