const verifiedOnly = (req, res, next) => {
  if (req.user && req.user.verificationStatus === 'approved') {
    next();
  } else {
    res.status(403).json({ message: 'You are not verified' });
  }
};

export { verifiedOnly };
export default verifiedOnly;
