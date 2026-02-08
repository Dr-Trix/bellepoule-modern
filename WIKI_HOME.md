# BellePoule Modern - Wiki Home

Welcome to BellePoule Modern comprehensive documentation hub. BellePoule Modern is a modern fencing tournament management software rewritten from original BellePoule using cutting-edge web technologies.

## 🤺 About BellePoule Modern

BellePoule Modern is a complete rewrite of legendary BellePoule fencing tournament software, bringing it into the modern era with:

- **Cross-platform support** (Windows, macOS, Linux)
- **Modern user interface** built with React
- **Real-time remote scoring** via web browsers
- **Automatic updates** and data protection
- **Enhanced file format compatibility** 
- **Professional-grade performance** with large competitions

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Build](https://github.com/klinnex/bellepoule-modern/actions/workflows/build.yml/badge.svg)

## 📚 Documentation Categories

### 👤 For Users

#### Getting Started
- **[Installation Guide](INSTALLATION.md)** - Download, install, and run BellePoule Modern on your platform
- **[User Manual](USER_MANUAL.md)** - Complete guide with screenshots for all features
- **[Migration Guide](MIGRATION_GUIDE.md)** - Transition from original BellePoule

#### Features & Usage
- **[Creating Competitions](USER_MANUAL.md#-creating-a-competition)** - Setup new tournaments
- **[Importing Fencers](USER_MANUAL.md#importing-fencers)** - FFF, CSV, XML file support
- **[Managing Phases](USER_MANUAL.md#managing-competition-phases)** - Check-in, pools, tableaux
- **[Remote Scoring](USER_MANUAL.md#remote-scoring-setup)** - Tablet/phone score entry
- **[Exporting Results](USER_MANUAL.md#exporting-results)** - Multiple format options

#### Support
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions
- **[File Format Specifications](FILE_FORMATS.md)** - Detailed format documentation

### 👨‍💻 For Developers

#### Development
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Architecture, setup, coding standards
- **[Architecture Overview](ARCHITECTURE.md)** - System design and components
- **[Remote Scoring Guide](REMOTE_SCORE_GUIDE.md)** - Technical documentation

#### Advanced Topics
- **[API Documentation](DEVELOPMENT_GUIDE.md#api-documentation)** - IPC and WebSocket APIs
- **[Database Schema](DEVELOPMENT_GUIDE.md#database-schema)** - SQLite database structure
- **[Testing Procedures](DEVELOPMENT_GUIDE.md#testing-procedures)** - Unit, integration, E2E tests

## 🚀 Quick Start

### For New Users

1. **[Download](INSTALLATION.md#-quick-install-recommended)** latest version for your platform
2. **[Install](INSTALLATION.md#step-2-install)** following platform-specific instructions  
3. **[Create](USER_MANUAL.md#-creating-a-competition)** your first competition
4. **[Import fencers](USER_MANUAL.md#importing-fencers)** from FFF/CSV files
5. **[Generate pools](USER_MANUAL.md#phase-2-pool-rounds)** automatically
6. **[Start scoring](USER_MANUAL.md#score-entry-interface)** matches

### For Users Migrating from Original BellePoule

1. **[Read Migration Guide](MIGRATION_GUIDE.md)** for planning
2. **[Export data](MIGRATION_GUIDE.md#data-compatibility)** from original BellePoule
3. **[Import to BellePoule Modern](MIGRATION_GUIDE.md#migration-workflows)**
4. **[Verify data](MIGRATION_GUIDE.md#testing-and-validation)** and test workflows

### For Developers

1. **[Clone repository](DEVELOPMENT_GUIDE.md#project-setup)**
2. **[Install dependencies](DEVELOPMENT_GUIDE.md#prerequisites)**
3. **[Run development server](DEVELOPMENT_GUIDE.md#development-scripts)**
4. **[Contribute](DEVELOPMENT_GUIDE.md#contributing-guidelines)** following guidelines

## ✨ Key Features

### 🏆 Competition Management
- Full fencing tournament support (épée, fleuret, sabre, laser sabre)
- Automatic pool generation with FIE rules
- Direct elimination tableau management
- Customizable competition formulas
- Multi-pool rounds support

### 👥 Fencer Management
- **Advanced FFF file parsing** with mixed format support
- CSV import/export with flexible delimiters
- XML BellePoule format compatibility
- Handle names with commas and special characters
- UTF-8 encoding support for international characters

### 📱 Remote Scoring
- **Built-in web server** for tablet/mobile access
- Real-time score synchronization
- Simple access code system
- Cross-platform browser support
- No additional software required

### 🛡️ Data Protection
- **Auto-save** every 2 minutes
- Competition backup on close
- SQLite database with data integrity
- Export to multiple formats
- Migration-friendly XML exports

### 🌐 Platform Support
- **Windows** (7+)
- **macOS** (10.14+) 
- **Linux** (Ubuntu 18.04+, other distributions)
- **Portable versions** available
- **Automatic updates** with user consent

## 📖 Documentation Structure

### User Documentation
```
User Guides/
├── Installation Guide           # Setup and requirements
├── User Manual                # Complete feature guide  
├── Migration Guide             # From original BellePoule
├── Troubleshooting Guide       # Common issues
└── File Format Specifications  # Import/export details
```

### Developer Documentation  
```
Developer Guides/
├── Development Guide           # Setup, coding, testing
├── Architecture Overview       # System design
├── Remote Scoring Guide       # Technical docs
├── API Documentation         # IPC and WebSocket APIs
└── Testing Procedures        # Quality assurance
```

## 🎯 Target Audiences

### Tournament Organizers
- Complete competition management from registration to results
- Professional-grade features for large tournaments
- Easy data import from federation files
- Remote scoring for efficient tournament flow

### Fencing Clubs
- Simple setup for club competitions
- Fencer database management
- Training and friendly match organization
- Results tracking and historical data

### Competition Administrators  
- Federation-standard compliance
- Multi-weapon support
- Export formats for official submissions
- Template system for recurring events

### Software Developers
- Open source contribution opportunities
- Modern web technology stack
- Cross-platform development experience
- Real-time web application architecture

## 🔧 Supported File Formats

### Import Formats
- **FFF files** (.fff, .csv) - French Fencing Federation standard
- **XML BellePoule** - Original BellePoule export format
- **CSV files** - Excel-compatible format with flexible delimiters
- **Mixed formats** - Advanced parsing for complex naming conventions

### Export Formats
- **XML BellePoule** - Compatible with original BellePoule
- **CSV files** - Excel and spreadsheet friendly
- **PDF reports** - Printable official results
- **HTML reports** - Web-viewable results

## 🆚 What's New vs Original BellePoule

| Feature | Original BellePoule | BellePoule Modern |
|---------|---------------------|-------------------|
| **Platform Support** | Windows, macOS | **Windows, macOS, Linux** ✅ |
| **User Interface** | Java Swing | **Modern React UI** ✅ |
| **Remote Scoring** | Basic/External | **Built-in WebSocket** ✅ |
| **Auto-save** | Manual | **Automatic (2 min)** ✅ |
| **Updates** | Manual download | **Automatic with consent** ✅ |
| **File Parsing** | Basic FFF | **Advanced mixed format** ✅ |
| **Performance** | Variable | **Optimized for large comps** ✅ |
| **Web Interface** | None | **Tablet/phone support** ✅ |

## 🌟 Recent Updates

### Version 1.0.0 (Latest)
- ✅ Full competition management
- ✅ Advanced FFF file parsing
- ✅ Remote scoring system
- ✅ Cross-platform support
- ✅ Auto-save functionality
- ✅ Multiple export formats

### Upcoming Features
- 🔄 Dark mode interface
- 🔄 Advanced reporting
- 🔄 Competition templates
- 🔄 Integration with timing systems
- 🔄 Mobile companion app

## 🤝 Contributing

We welcome contributions from the community! See the [Development Guide](DEVELOPMENT_GUIDE.md) for:

- **Code contributions** - Setup, coding standards, testing
- **Bug reports** - Using built-in reporter or GitHub Issues
- **Feature requests** - Submit with detailed requirements
- **Documentation** - Improve guides and translations
- **Testing** - Help with quality assurance

### Quick Contribution Steps

1. **Fork repository** and create feature branch
2. **Follow coding standards** in [Development Guide](DEVELOPMENT_GUIDE.md#code-style-and-conventions)
3. **Write tests** for new features
4. **Submit Pull Request** with clear description
5. **Respond to reviews** and make requested changes

## 📞 Getting Help

### Built-in Support
- **Bug Reporter**: Menu → Help → Report Bug (Ctrl+Shift+I)
- **System Information**: Menu → Help → System Information
- **Automatic Updates**: Check for updates on startup

### Community Support  
- **GitHub Issues**: [Report bugs](https://github.com/klinnex/bellepoule-modern/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/klinnex/bellepoule-modern/discussions)
- **Documentation Wiki**: Community-contributed guides

### Professional Support
- Email support for licensed organizations
- Priority bug fixing and feature development
- On-site training and migration assistance
- Custom integration development

## 📊 Project Statistics

- **Development Started**: 2023
- **First Release**: v1.0.0 (2024)
- **Lines of Code**: ~15,000+ TypeScript/React
- **Test Coverage**: 80%+ target
- **Platform Support**: 3 major platforms
- **Language Support**: French (primary), English (docs)

## 🎯 Roadmap

### Short Term (Q1 2024)
- [ ] Performance optimizations for 1000+ fencers
- [ ] Advanced competition templates
- [ ] Dark mode interface
- [ ] Enhanced PDF reporting

### Medium Term (Q2-Q3 2024)  
- [ ] Mobile companion app
- [ ] Integration with federation databases
- [ ] Advanced analytics and statistics
- [ ] Multi-language UI support

### Long Term (2025+)
- [ ] Cloud synchronization
- [ ] AI-assisted competition management
- [ ] Live streaming integration
- [ ] Advanced scoring systems

## 📄 License

BellePoule Modern is licensed under **GPL-3.0**, the same license as the original BellePoule. This ensures the software remains free and open source while respecting the original project's philosophy.

---

## 🚀 Get Started Now

Ready to modernize your fencing tournament management?

### 📥 **[Download Latest Version](https://github.com/klinnex/bellepoule-modern/releases/tag/latest)**

### 📖 **[Read Installation Guide](INSTALLATION.md)**

### 🆘 **[Get Help](TROUBLESHOOTING.md)**

---

*Join the modern era of fencing tournament management with BellePoule Modern - built by fencers, for fencers, with modern technology.* 🤺

*For the fencing community, by the fencing community.*