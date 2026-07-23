import College from '../models/College.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Notification from '../models/Notification.js';
import PrintOrder from '../models/PrintOrder.js';

export const seedData = async () => {
  try {
    // Clear existing data
    await College.deleteMany({});
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Notification.deleteMany({});
    await PrintOrder.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed Colleges
    const view = await College.create({
      name: "Vignan's Institute of Engineering for Women (VIEW)",
      isActive: true
    });
    await College.create({
      name: "Vignan's Institute of Information Technology (VIIT)",
      isActive: true
    });
    console.log('Colleges seeded successfully.');

    // 2. Seed Users
    // Admin user
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@vignan.edu.in',
      password: 'admin123',
      whatsappNumber: '919876543210',
      registrationNumber: 'ADMIN-001',
      department: 'Administration',
      year: '4th Year',
      college: view.name,
      idCardImageUrl: '/images/file_0000000024747207aa9ab38052a0cc35.png',
      role: 'admin',
      verificationStatus: 'approved'
    });

    // Verified Student (Arjun Sharma - Seller of seed listings)
    const arjun = await User.create({
      fullName: 'Arjun Sharma',
      email: 'arjun.sharma@vignan.edu.in',
      password: 'password123',
      whatsappNumber: '919876543210',
      registrationNumber: '21F31A0512',
      department: 'Computer Science Engineering',
      year: '3rd Year',
      college: view.name,
      idCardImageUrl: '/images/file_0000000024747207aa9ab38052a0cc35.png',
      role: 'student',
      verificationStatus: 'approved'
    });

    // Pending Student (Pavan Kumar)
    const pavan = await User.create({
      fullName: 'Pavan Kumar',
      email: 'pavan.kumar@vignan.edu.in',
      password: 'password123',
      whatsappNumber: '918765432109',
      registrationNumber: '21F31A0545',
      department: 'Computer Science Engineering',
      year: '3rd Year',
      college: view.name,
      idCardImageUrl: '/images/file_0000000024747207aa9ab38052a0cc35.png',
      role: 'student',
      verificationStatus: 'pending'
    });

    console.log('Users seeded successfully.');

    // 3. Seed Sample Listings
    const sampleListings = [
      {
        title: 'Data Structures Using C',
        description: 'Standard textbook for 2nd year engineering students. Cover is slightly worn out but all pages are clean with no handwriting. Extremely useful for semester exams and coding interviews.',
        price: 250,
        images: ['/images/file_00000000968c71f8895e41375cd51838.png'],
        category: 'Books',
        condition: 'Good',
        listingType: 'sell',
        marketType: 'general',
        seller: arjun._id,
        sellerCollege: view.name,
        sellerWhatsappNumber: arjun.whatsappNumber,
        status: 'available'
      },
      {
        title: 'Casio fx-991 Calculator',
        description: 'Original Casio FX-991 EX ClassWiz scientific calculator. Fully functional, dynamic solar panel, and in great condition. Recommended for all engineering branches.',
        price: 750,
        images: ['/images/file_0000000006d871fa89f7ea6cc8b17d67.png'],
        category: 'Electronics',
        condition: 'Like New',
        listingType: 'sell',
        marketType: 'college',
        seller: arjun._id,
        sellerCollege: view.name,
        sellerWhatsappNumber: arjun.whatsappNumber,
        status: 'available'
      },
      {
        title: 'LED Study Lamp',
        description: 'Rechargeable LED desk lamp with 3 brightness modes. Touch switch control and flexible goose-neck. Perfect for late-night exam preparations.',
        price: 300,
        images: ['/images/file_0000000016d472068c399cb8bd91ea66.png'],
        category: 'Electronics',
        condition: 'Excellent',
        listingType: 'sell',
        marketType: 'general',
        seller: arjun._id,
        sellerCollege: view.name,
        sellerWhatsappNumber: arjun.whatsappNumber,
        status: 'available'
      },
      {
        title: 'Hoodie - Size M',
        description: 'Premium gray hoodie, size M. Fleece fabric, super comfortable and warm. Barely worn twice, selling because size is too small.',
        price: 500,
        images: ['/images/file_000000007d747207a0ff28c43b546616.png'],
        category: 'Gifts & More',
        condition: 'Excellent',
        listingType: 'sell',
        marketType: 'college',
        seller: arjun._id,
        sellerCollege: view.name,
        sellerWhatsappNumber: arjun.whatsappNumber,
        status: 'available'
      }
    ];

    await Listing.insertMany(sampleListings);
    console.log('Sample listings seeded successfully.');

    // 4. Seed Notifications
    await Notification.insertMany([
      {
        recipient: arjun._id,
        title: 'Account Verified! 🎉',
        message: "Congratulations Arjun! Your student identity has been verified. You can now post books/items and chat with buyers.",
        type: 'verification',
        isRead: false
      },
      {
        recipient: pavan._id,
        title: 'Complete Verification 🎓',
        message: "Welcome to Vignan's Marketplace! Please upload a clear image of your student identity card to unlock full features like posting listings and messaging.",
        type: 'system',
        isRead: false
      }
    ]);
    console.log('Sample notifications seeded successfully.');

    // 5. Seed Print Orders (matching prompt spec counts & classes)
    const samplePrintOrders = [
      // ── VERIFICATION QUEUE (4 pending orders) ──
      {
        student: arjun._id,
        studentName: 'Arjun Sharma',
        registrationNumber: '21F31A0512',
        contactNumber: '9391461855',
        department: 'CSE',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/unit_1_study_material.pdf',
            fileName: 'unit_1_study_material.pdf',
            pagesCount: 13,
            layout: 'both-side',
            colorType: 'bw',
            binding: 'none',
            sets: 1,
            subtotal: 67.60
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-9A3B',
        deliveryDate: new Date(Date.now() + 86400000 * 2), // 48 hours in future
        totalPrice: 67.60,
        status: 'pending'
      },
      {
        student: pavan._id,
        studentName: 'Pavan Kumar',
        registrationNumber: '21F31A0545',
        contactNumber: '9876543210',
        department: 'IT',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/lab_manual.pdf',
            fileName: 'lab_manual.pdf',
            pagesCount: 20,
            layout: 'single-side',
            colorType: 'bw',
            binding: 'spiral',
            sets: 2,
            subtotal: 80.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-4X9Y',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 80.00,
        status: 'pending'
      },
      {
        student: arjun._id,
        studentName: 'Arjun Sharma',
        registrationNumber: '21F31A0512',
        contactNumber: '9391461855',
        department: 'ECE',
        section: '3',
        files: [
          {
            pdfFileUrl: '/pdfs/ece_circuit_diagrams.pdf',
            fileName: 'ece_circuit_diagrams.pdf',
            pagesCount: 5,
            layout: 'single-side',
            colorType: 'color',
            binding: 'none',
            sets: 1,
            subtotal: 25.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-8K2L',
        deliveryDate: new Date(Date.now() + 86400000 * 3),
        totalPrice: 25.00,
        status: 'pending'
      },
      {
        student: pavan._id,
        studentName: 'Pavan Kumar',
        registrationNumber: '21F31A0545',
        contactNumber: '9876543210',
        department: 'DS',
        section: '3',
        files: [
          {
            pdfFileUrl: '/pdfs/data_science_cheatsheet.pdf',
            fileName: 'data_science_cheatsheet.pdf',
            pagesCount: 8,
            layout: 'both-side',
            colorType: 'color',
            binding: 'none',
            sets: 2,
            subtotal: 48.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-3N7M',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 48.00,
        status: 'pending'
      },

      // ── ACTIVE JOBS QUEUE (6 printing orders: CSE-2 (3), IT-2 (2), ECE-3 (1)) ──
      {
        student: arjun._id,
        studentName: 'Sai Kiran',
        registrationNumber: '21F31A0550',
        contactNumber: '9988776655',
        department: 'CSE',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/cse_notes.pdf',
            fileName: 'cse_notes.pdf',
            pagesCount: 15,
            layout: 'both-side',
            colorType: 'bw',
            binding: 'none',
            sets: 1,
            subtotal: 15.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-2X3Y',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 15.00,
        status: 'printing'
      },
      {
        student: arjun._id,
        studentName: 'Manoj Kumar',
        registrationNumber: '21F31A0560',
        contactNumber: '9876543210',
        department: 'CSE',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/cse_assignment.pdf',
            fileName: 'cse_assignment.pdf',
            pagesCount: 10,
            layout: 'single-side',
            colorType: 'bw',
            binding: 'none',
            sets: 2,
            subtotal: 20.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-5A6B',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 20.00,
        status: 'printing'
      },
      {
        student: arjun._id,
        studentName: 'Divya Sri',
        registrationNumber: '21F31A0580',
        contactNumber: '8877665544',
        department: 'CSE',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/cse_project_report.pdf',
            fileName: 'cse_project_report.pdf',
            pagesCount: 50,
            layout: 'both-side',
            colorType: 'color',
            binding: 'spiral',
            sets: 1,
            subtotal: 250.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-9P8Q',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 250.00,
        status: 'printing'
      },
      {
        student: arjun._id,
        studentName: 'Girish Kumar',
        registrationNumber: '21F31A1210',
        contactNumber: '7766554433',
        department: 'IT',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/it_dbms.pdf',
            fileName: 'it_dbms.pdf',
            pagesCount: 30,
            layout: 'both-side',
            colorType: 'bw',
            binding: 'none',
            sets: 1,
            subtotal: 30.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-7R6S',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 30.00,
        status: 'printing'
      },
      {
        student: arjun._id,
        studentName: 'Swapna Sen',
        registrationNumber: '21F31A1240',
        contactNumber: '6655443322',
        department: 'IT',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/it_network_lab.pdf',
            fileName: 'it_network_lab.pdf',
            pagesCount: 12,
            layout: 'single-side',
            colorType: 'color',
            binding: 'none',
            sets: 1,
            subtotal: 60.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-4Z5W',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 60.00,
        status: 'printing'
      },
      {
        student: arjun._id,
        studentName: 'Ravi Teja',
        registrationNumber: '21F31A0450',
        contactNumber: '9900887766',
        department: 'ECE',
        section: '3',
        files: [
          {
            pdfFileUrl: '/pdfs/ece_microcontroller.pdf',
            fileName: 'ece_microcontroller.pdf',
            pagesCount: 40,
            layout: 'both-side',
            colorType: 'bw',
            binding: 'spiral',
            sets: 1,
            subtotal: 90.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-1X2Y',
        deliveryDate: new Date(Date.now() + 86400000 * 2),
        totalPrice: 90.00,
        status: 'printing'
      },

      // ── DELIVERY LOGS (3 out-for-delivery orders) ──
      {
        student: arjun._id,
        studentName: 'Harsha Vardhan',
        registrationNumber: '21F31A0520',
        contactNumber: '9391461855',
        department: 'CSE',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/compiler_design.pdf',
            fileName: 'compiler_design.pdf',
            pagesCount: 35,
            layout: 'both-side',
            colorType: 'bw',
            binding: 'none',
            sets: 1,
            subtotal: 35.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-6F7G',
        deliveryDate: new Date(Date.now() + 86400000),
        totalPrice: 35.00,
        status: 'out-for-delivery'
      },
      {
        student: arjun._id,
        studentName: 'Sireesha G',
        registrationNumber: '21F31A1255',
        contactNumber: '8877995544',
        department: 'IT',
        section: '2',
        files: [
          {
            pdfFileUrl: '/pdfs/web_tech_notes.pdf',
            fileName: 'web_tech_notes.pdf',
            pagesCount: 15,
            layout: 'both-side',
            colorType: 'color',
            binding: 'none',
            sets: 1,
            subtotal: 75.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-2Q3R',
        deliveryDate: new Date(Date.now() + 86400000),
        totalPrice: 75.00,
        status: 'out-for-delivery'
      },
      {
        student: arjun._id,
        studentName: 'Naveen Kumar',
        registrationNumber: '21F31A0470',
        contactNumber: '7766885544',
        department: 'ECE',
        section: '3',
        files: [
          {
            pdfFileUrl: '/pdfs/vlsi_design.pdf',
            fileName: 'vlsi_design.pdf',
            pagesCount: 22,
            layout: 'both-side',
            colorType: 'bw',
            binding: 'none',
            sets: 1,
            subtotal: 22.00
          }
        ],
        paymentScreenshotUrl: '/images/em_print_orders_banner.jpg',
        upiReference: 'UPI-EM-8S9T',
        deliveryDate: new Date(Date.now() + 86400000),
        totalPrice: 22.00,
        status: 'out-for-delivery'
      }
    ];

    await PrintOrder.insertMany(samplePrintOrders);
    console.log('Sample print orders seeded successfully.');
  } catch (error) {
    console.error('Error during seeding data:', error);
    throw error;
  }
};
