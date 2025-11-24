# Security Guidelines for CPR Fantasy Football

This document outlines security practices for maintaining and updating the conda environment.

## Package Security Strategy

### Version Constraints
We use **conservative version ranges** to balance security and stability:
- Minimum versions ensure security patches are included
- Maximum versions (major version caps) prevent breaking changes
- Example: `requests>=2.31.0,<3.0.0` ensures security patches while avoiding v3 breaking changes

### Channels
**Preferred order:**
1. `conda-forge` - Community-driven, actively maintained, good security practices
2. `defaults` - Official Anaconda packages as fallback

## How to Check Package Security

### 1. Check for Known Vulnerabilities

#### Using pip-audit (for dependency scanning)
```bash
conda activate cpr-fantasy-football
pip install pip-audit
pip-audit
```

#### Using safety (Python vulnerability database)
```bash
conda install safety
safety check --json
```

### 2. Check Conda Package Metadata
```bash
# View package information including build date and dependencies
conda search streamlit --info

# Check specific version details
conda list streamlit
```

### 3. Monitor CVE Databases

**Resources:**
- **GitHub Advisory Database**: https://github.com/advisories
- **National Vulnerability Database**: https://nvd.nist.gov/
- **Snyk Vulnerability DB**: https://security.snyk.io/
- **PyPI Advisory Database**: https://github.com/pypa/advisory-database

**For our key packages:**
- Streamlit: https://github.com/streamlit/streamlit/security
- Pandas: https://github.com/pandas-dev/pandas/security
- Requests: https://github.com/psf/requests/security

### 4. Automated Scanning (Recommended)

#### GitHub Dependabot
Already enabled for this repository. Dependabot will:
- Scan for vulnerable dependencies
- Create pull requests with security updates
- Provide CVE details and remediation guidance

#### Snyk (Optional)
```bash
# Install Snyk CLI
npm install -g snyk

# Test for vulnerabilities
snyk test --file=environment.yml
```

## Update Strategy

### Regular Updates (Monthly)
```bash
# Update all packages to latest secure versions within constraints
conda update --all

# Export updated environment
conda env export --no-builds > environment-updated.yml

# Test thoroughly before deploying
```

### Security Updates (Immediate)
When a security advisory is published:

1. **Assess Impact**
   ```bash
   # Check if affected package is installed
   conda list <package-name>
   ```

2. **Update Specific Package**
   ```bash
   # Update just the vulnerable package
   conda update <package-name>
   ```

3. **Test Application**
   ```bash
   streamlit run app.py
   # Run through all pages manually
   ```

4. **Deploy**
   ```bash
   git add environment.yml
   git commit -m "Security update: <package-name> to fix CVE-XXXX-XXXX"
   git push
   ```

## Security Best Practices

### 1. Pin Python Version
✅ We pin Python to `3.11.*` for stability while receiving patch updates

### 2. Use Version Ranges, Not Exact Pins
✅ We use `>=X.Y.Z,<MAJOR+1.0.0` to allow security patches

### 3. Avoid Unnecessary Dependencies
✅ Our environment only includes essential packages

### 4. Regular Security Audits
**Schedule:** Run security checks monthly or after major updates

```bash
# Complete security audit
conda activate cpr-fantasy-football
pip install pip-audit safety
pip-audit
safety check
```

### 5. Monitor Security Advisories
**Subscribe to:**
- GitHub Security Advisories for each dependency
- Streamlit releases: https://github.com/streamlit/streamlit/releases
- Pandas security announcements

### 6. Test Before Deploying
Always test updates in a local environment before deploying to production:
```bash
# Create test environment
conda env create -f environment.yml -n cpr-test
conda activate cpr-test
streamlit run app.py
# Test all functionality
```

## Current Package Security Status

Last security review: 2024-11-24

| Package | Version Range | Known Issues | Status |
|---------|---------------|--------------|--------|
| python | 3.11.* | None | ✅ Secure |
| pandas | >=2.0.0,<3.0.0 | None | ✅ Secure |
| requests | >=2.31.0,<3.0.0 | None | ✅ Secure |
| streamlit | >=1.31.0,<2.0.0 | None | ✅ Secure |
| altair | >=5.0.0,<6.0.0 | None | ✅ Secure |

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT open a public issue**
2. Contact the repository maintainer privately
3. Include details: affected component, impact, and reproduction steps

## Additional Resources

- **Conda Security**: https://docs.conda.io/projects/conda/en/latest/user-guide/concepts/security.html
- **Python Security**: https://www.python.org/news/security/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CWE Database**: https://cwe.mitre.org/

---

**Last Updated:** 2024-11-24
**Next Review:** 2024-12-24
