import College from '../models/College.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

export const seedData = async () => {
  try {
    // Clear existing data
    await College.deleteMany({});
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed College
    const college = await College.create({
      name: 'Vignan Institute of Information Technology',
      isActive: true
    });
    console.log('College seeded successfully.');

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
      college: college.name,
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
      college: college.name,
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
      college: college.name,
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
        marketType: 'college',
        seller: arjun._id,
        sellerCollege: college.name,
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
        sellerCollege: college.name,
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
        marketType: 'college',
        seller: arjun._id,
        sellerCollege: college.name,
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
        sellerCollege: college.name,
        sellerWhatsappNumber: arjun.whatsappNumber,
        status: 'available'
      }
    ];

    await Listing.insertMany(sampleListings);
    console.log('Sample listings seeded successfully.');
  } catch (error) {
    console.error('Error during seeding data:', error);
    throw error;
  }
};
