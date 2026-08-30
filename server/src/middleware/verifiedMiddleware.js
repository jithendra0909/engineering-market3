const verifiedOnly = (req, res, next) => {
  if (req.user && (req.user.verificationStatus === 'approved' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Your account is pending verification or has been restricted.' });
  }
};

export { verifiedOnly };
export default verifiedOnly;
