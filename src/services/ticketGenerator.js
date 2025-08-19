// PDF Ticket Generation Service
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

class TicketGenerator {
  constructor() {
    this.pageWidth = 210 // A4 width in mm
    this.pageHeight = 297 // A4 height in mm
    this.margin = 20
  }

  // Generate boarding pass PDF
  async generateBoardingPass(booking) {
    const pdf = new jsPDF()
    
    // Set font
    pdf.setFont('helvetica')
    
    for (let i = 0; i < booking.passengers.length; i++) {
      if (i > 0) pdf.addPage()
      
      const passenger = booking.passengers[i]
      const flight = booking.flight
      const seat = booking.seats.find(s => s.passengerId === passenger.id)
      
      await this.renderBoardingPass(pdf, booking, passenger, flight, seat)
    }
    
    return pdf
  }

  // Generate detailed ticket PDF
  async generateDetailedTicket(booking) {
    const pdf = new jsPDF()
    
    // Add company header
    this.addHeader(pdf)
    
    // Add booking details
    this.addBookingDetails(pdf, booking)
    
    // Add flight information
    this.addFlightInformation(pdf, booking.flight)
    
    // Add passenger information
    this.addPassengerInformation(pdf, booking.passengers)
    
    // Add seat information
    this.addSeatInformation(pdf, booking.seats)
    
    // Add pricing breakdown
    this.addPricingBreakdown(pdf, booking.pricing)
    
    // Add terms and conditions
    this.addTermsAndConditions(pdf)
    
    // Add QR code
    await this.addQRCode(pdf, booking.bookingReference)
    
    return pdf
  }

  // Generate e-ticket PDF
  async generateETicket(booking) {
    const pdf = new jsPDF()
    
    for (let i = 0; i < booking.passengers.length; i++) {
      if (i > 0) pdf.addPage()
      
      const passenger = booking.passengers[i]
      await this.renderETicket(pdf, booking, passenger)
    }
    
    return pdf
  }

  // Render boarding pass layout
  async renderBoardingPass(pdf, booking, passenger, flight, seat) {
    const yStart = 20
    
    // Header
    pdf.setFontSize(20)
    pdf.setTextColor(25, 118, 210) // Blue
    pdf.text('BOARDING PASS', this.margin, yStart)
    
    // Airline info
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`${flight.airline.name}`, this.margin, yStart + 15)
    pdf.text(`Flight: ${flight.flightNumber}`, this.margin, yStart + 25)
    
    // Main boarding pass section
    const mainSection = {
      x: this.margin,
      y: yStart + 40,
      width: 140,
      height: 80
    }
    
    // Draw main section border
    pdf.rect(mainSection.x, mainSection.y, mainSection.width, mainSection.height)
    
    // Passenger info
    pdf.setFontSize(14)
    pdf.text(`${passenger.firstName} ${passenger.lastName}`, mainSection.x + 5, mainSection.y + 15)
    
    pdf.setFontSize(10)
    pdf.text('PASSENGER NAME', mainSection.x + 5, mainSection.y + 10)
    
    // Flight details in main section
    const flightDetails = [
      { label: 'FROM', value: `${flight.origin.code}\n${flight.origin.city}`, x: 5, y: 30 },
      { label: 'TO', value: `${flight.destination.code}\n${flight.destination.city}`, x: 45, y: 30 },
      { label: 'DATE', value: this.formatDate(flight.departure.time), x: 85, y: 30 },
      { label: 'TIME', value: this.formatTime(flight.departure.time), x: 110, y: 30 },
      { label: 'SEAT', value: seat?.seatNumber || 'N/A', x: 5, y: 55 },
      { label: 'GATE', value: flight.departure.gate || 'TBA', x: 30, y: 55 },
      { label: 'BOARDING', value: this.getBoardingTime(flight.departure.time), x: 55, y: 55 },
      { label: 'CLASS', value: seat?.class?.toUpperCase() || 'ECO', x: 85, y: 55 }
    ]
    
    flightDetails.forEach(detail => {
      pdf.setFontSize(8)
      pdf.text(detail.label, mainSection.x + detail.x, mainSection.y + detail.y)
      pdf.setFontSize(10)
      pdf.text(detail.value, mainSection.x + detail.x, mainSection.y + detail.y + 8)
    })
    
    // Stub section (right side)
    const stubSection = {
      x: mainSection.x + mainSection.width + 5,
      y: mainSection.y,
      width: 40,
      height: mainSection.height
    }
    
    // Draw stub border
    pdf.rect(stubSection.x, stubSection.y, stubSection.width, stubSection.height)
    
    // Stub details
    pdf.setFontSize(8)
    pdf.text('BOARDING PASS', stubSection.x + 2, stubSection.y + 10)
    
    pdf.setFontSize(10)
    pdf.text(flight.flightNumber, stubSection.x + 2, stubSection.y + 20)
    pdf.text(`${flight.origin.code}-${flight.destination.code}`, stubSection.x + 2, stubSection.y + 28)
    pdf.text(seat?.seatNumber || 'N/A', stubSection.x + 2, stubSection.y + 36)
    pdf.text(this.formatDate(flight.departure.time), stubSection.x + 2, stubSection.y + 44)
    
    // Add QR code to stub
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({
        bookingRef: booking.bookingReference,
        passenger: `${passenger.firstName} ${passenger.lastName}`,
        flight: flight.flightNumber,
        seat: seat?.seatNumber
      }),
      { width: 80, margin: 1 }
    )
    
    pdf.addImage(qrCode, 'PNG', stubSection.x + 2, stubSection.y + 50, 25, 25)
    
    // Booking reference at bottom
    pdf.setFontSize(12)
    pdf.text(`Booking Reference: ${booking.bookingReference}`, this.margin, mainSection.y + mainSection.height + 20)
    
    // Important notices
    pdf.setFontSize(8)
    const notices = [
      '• Please arrive at the gate 30 minutes before departure',
      '• Check-in closes 30 minutes before departure',
      '• This boarding pass is required for boarding'
    ]
    
    notices.forEach((notice, index) => {
      pdf.text(notice, this.margin, mainSection.y + mainSection.height + 35 + (index * 8))
    })
  }

  // Render e-ticket layout
  async renderETicket(pdf, booking, passenger) {
    // Header
    this.addHeader(pdf)
    
    // E-ticket title
    pdf.setFontSize(18)
    pdf.setTextColor(25, 118, 210)
    pdf.text('ELECTRONIC TICKET', this.margin, 50)
    
    // Passenger name
    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Passenger: ${passenger.firstName} ${passenger.lastName}`, this.margin, 65)
    
    // Booking reference
    pdf.setFontSize(12)
    pdf.text(`Booking Reference: ${booking.bookingReference}`, this.margin, 75)
    
    // Flight details table
    const tableY = 90
    const rowHeight = 8
    const colWidths = [40, 50, 40, 40]
    const headers = ['Flight', 'Route', 'Date', 'Time']
    
    // Table headers
    pdf.setFillColor(240, 240, 240)
    pdf.rect(this.margin, tableY, colWidths.reduce((a, b) => a + b), rowHeight, 'F')
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    let xPos = this.margin + 2
    headers.forEach((header, index) => {
      pdf.text(header, xPos, tableY + 6)
      xPos += colWidths[index]
    })
    
    // Flight data
    const flightData = [
      booking.flight.flightNumber,
      `${booking.flight.origin.code} → ${booking.flight.destination.code}`,
      this.formatDate(booking.flight.departure.time),
      this.formatTime(booking.flight.departure.time)
    ]
    
    xPos = this.margin + 2
    flightData.forEach((data, index) => {
      pdf.text(data, xPos, tableY + rowHeight + 6)
      xPos += colWidths[index]
    })
    
    // Draw table borders
    pdf.rect(this.margin, tableY, colWidths.reduce((a, b) => a + b), rowHeight * 2)
    
    // Seat information
    const seat = booking.seats.find(s => s.passengerId === passenger.id)
    if (seat) {
      pdf.setFontSize(12)
      pdf.text(`Seat: ${seat.seatNumber} (${seat.class})`, this.margin, tableY + 30)
    }
    
    // Fare details
    pdf.setFontSize(10)
    pdf.text('Fare Breakdown:', this.margin, tableY + 50)
    pdf.text(`Base Fare: $${booking.pricing.baseFare}`, this.margin, tableY + 60)
    pdf.text(`Taxes & Fees: $${booking.pricing.taxes}`, this.margin, tableY + 70)
    pdf.text(`Total: $${booking.pricing.total}`, this.margin, tableY + 80)
    
    // QR code
    const qrCode = await QRCode.toDataURL(
      `https://checkin.flightbooking.com/${booking.bookingReference}`,
      { width: 120, margin: 2 }
    )
    
    pdf.addImage(qrCode, 'PNG', this.pageWidth - 60, tableY + 40, 40, 40)
    
    // Terms
    pdf.setFontSize(8)
    pdf.text('This is your electronic ticket. Please save this document for your records.', this.margin, tableY + 100)
  }

  // Add company header
  addHeader(pdf) {
    // Logo placeholder
    pdf.setFillColor(25, 118, 210)
    pdf.circle(this.margin + 10, 15, 8, 'F')
    
    // Company name
    pdf.setFontSize(16)
    pdf.setTextColor(25, 118, 210)
    pdf.text('FlightBooking', this.margin + 25, 20)
    
    // Divider line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(this.margin, 25, this.pageWidth - this.margin, 25)
  }

  // Add booking details section
  addBookingDetails(pdf, booking) {
    let y = 40
    
    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Booking Details', this.margin, y)
    
    y += 10
    pdf.setFontSize(10)
    pdf.text(`Booking Reference: ${booking.bookingReference}`, this.margin, y)
    pdf.text(`Booking Date: ${this.formatDate(booking.bookingDate)}`, this.margin + 80, y)
    
    y += 8
    pdf.text(`Status: ${booking.status}`, this.margin, y)
    pdf.text(`PNR: ${booking.pnr || 'N/A'}`, this.margin + 80, y)
    
    return y + 15
  }

  // Add flight information section
  addFlightInformation(pdf, flight) {
    let y = 80
    
    pdf.setFontSize(14)
    pdf.text('Flight Information', this.margin, y)
    
    y += 10
    pdf.setFontSize(10)
    
    // Flight details in two columns
    const leftCol = this.margin
    const rightCol = this.margin + 90
    
    pdf.text(`Flight Number: ${flight.flightNumber}`, leftCol, y)
    pdf.text(`Aircraft: ${flight.aircraft}`, rightCol, y)
    
    y += 8
    pdf.text(`Airline: ${flight.airline.name}`, leftCol, y)
    pdf.text(`Duration: ${flight.duration.formatted}`, rightCol, y)
    
    y += 8
    pdf.text(`From: ${flight.origin.name}`, leftCol, y)
    pdf.text(`Departure: ${this.formatDateTime(flight.departure.time)}`, rightCol, y)
    
    y += 8
    pdf.text(`To: ${flight.destination.name}`, leftCol, y)
    pdf.text(`Arrival: ${this.formatDateTime(flight.arrival.time)}`, rightCol, y)
    
    if (flight.stops.length > 0) {
      y += 8
      pdf.text(`Stops: ${flight.stops.length} (${flight.stops.map(s => s.airport.code).join(', ')})`, leftCol, y)
    }
    
    return y + 15
  }

  // Add passenger information section
  addPassengerInformation(pdf, passengers) {
    let y = 140
    
    pdf.setFontSize(14)
    pdf.text('Passenger Information', this.margin, y)
    
    y += 10
    pdf.setFontSize(10)
    
    passengers.forEach((passenger, index) => {
      pdf.text(`${index + 1}. ${passenger.title} ${passenger.firstName} ${passenger.lastName}`, this.margin, y)
      pdf.text(`Type: ${passenger.type} | DOB: ${this.formatDate(passenger.dateOfBirth)}`, this.margin + 20, y + 6)
      y += 14
    })
    
    return y + 10
  }

  // Add seat information section
  addSeatInformation(pdf, seats) {
    let y = 200
    
    pdf.setFontSize(14)
    pdf.text('Seat Assignment', this.margin, y)
    
    y += 10
    pdf.setFontSize(10)
    
    seats.forEach((seat, index) => {
      pdf.text(`Passenger ${index + 1}: Seat ${seat.seatNumber} (${seat.class})`, this.margin, y)
      if (seat.price > 0) {
        pdf.text(`Seat Fee: $${seat.price}`, this.margin + 80, y)
      }
      y += 8
    })
    
    return y + 10
  }

  // Add pricing breakdown section
  addPricingBreakdown(pdf, pricing) {
    let y = 240
    
    pdf.setFontSize(14)
    pdf.text('Pricing Breakdown', this.margin, y)
    
    y += 10
    pdf.setFontSize(10)
    
    const items = [
      { label: 'Base Fare', amount: pricing.baseFare },
      { label: 'Taxes & Fees', amount: pricing.taxes },
      { label: 'Seat Selection', amount: pricing.seatFees || 0 },
      { label: 'Baggage', amount: pricing.baggage || 0 }
    ]
    
    items.forEach(item => {
      if (item.amount > 0) {
        pdf.text(item.label, this.margin, y)
        pdf.text(`$${item.amount}`, this.margin + 100, y)
        y += 8
      }
    })
    
    // Total line
    pdf.setLineWidth(0.5)
    pdf.line(this.margin, y, this.margin + 120, y)
    y += 8
    
    pdf.setFontSize(12)
    pdf.text('Total Amount', this.margin, y)
    pdf.text(`$${pricing.total}`, this.margin + 100, y)
    
    return y + 15
  }

  // Add terms and conditions
  addTermsAndConditions(pdf) {
    const y = 280
    
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    
    const terms = [
      'Terms & Conditions: This ticket is subject to the airline\'s terms and conditions.',
      'Changes and cancellations may incur fees. Please check the airline\'s policy.',
      'Check-in online 24 hours before departure or at the airport.',
      'Arrive at the airport at least 2 hours before domestic flights, 3 hours before international flights.'
    ]
    
    terms.forEach((term, index) => {
      pdf.text(term, this.margin, y + (index * 6))
    })
  }

  // Add QR code
  async addQRCode(pdf, bookingReference) {
    const qrData = {
      bookingRef: bookingReference,
      checkInUrl: `https://checkin.flightbooking.com/${bookingReference}`,
      timestamp: Date.now()
    }
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      margin: 2
    })
    
    pdf.addImage(qrCode, 'PNG', this.pageWidth - 60, 30, 40, 40)
    
    pdf.setFontSize(8)
    pdf.text('Scan for check-in', this.pageWidth - 55, 75)
  }

  // Utility methods
  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  formatTime(dateString) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  formatDateTime(dateString) {
    return `${this.formatDate(dateString)} ${this.formatTime(dateString)}`
  }

  getBoardingTime(departureTime) {
    const departure = new Date(departureTime)
    const boarding = new Date(departure.getTime() - 30 * 60000) // 30 minutes before
    return this.formatTime(boarding.toISOString())
  }

  // Export methods
  async downloadPDF(pdf, filename) {
    pdf.save(filename)
  }

  async getPDFBlob(pdf) {
    return pdf.output('blob')
  }

  async getPDFDataURL(pdf) {
    return pdf.output('dataurlstring')
  }
}

// Export singleton instance
export default new TicketGenerator()