function ensureSite(req, res, next) {
  // set site id if the user has one
  if(!req.session.site_id) {
    req.session.site_id = req.user.sites ? req.user.sites[0] ? req.user.sites[0].site_id : null : null;
  }

  // if there's still not a site... then ask them to create one or join a site
  if(!req.session.site_id) {
    res.redirect('/sites/new');
  }

  next()
}

module.exports = ensureSite;
