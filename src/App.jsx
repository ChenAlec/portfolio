import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Github, Linkedin, Mail, FileText, Box, Cpu, PenTool, Upload, X, ChevronRight, ExternalLink, Menu } from 'lucide-react';

/**
 * UTILITY: Script Loader for Three.js
 * Loads Three.js and STLLoader dynamically so the 3D features work in the browser.
 */
const useThreeScripts = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.THREE) {
      setLoaded(true);
      return;
    }

    const loadThree = async () => {
      try {
        // Load main Three.js
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        threeScript.async = true;
        document.body.appendChild(threeScript);

        await new Promise((resolve) => {
          threeScript.onload = resolve;
        });

        // Load STLLoader (Needs to be loaded after Three)
        const stlScript = document.createElement('script');
        stlScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js';
        stlScript.async = true;
        document.body.appendChild(stlScript);

        await new Promise((resolve) => {
          stlScript.onload = resolve;
        });

        setLoaded(true);
      } catch (e) {
        console.error("Failed to load 3D libraries", e);
      }
    };

    loadThree();
  }, []);

  return loaded;
};

/**
 * COMPONENT: 3D Background / STL Viewer
 */
const ThreeCanvas = ({ stlFile }) => {
  const containerRef = useRef(null);
  const scriptsLoaded = useThreeScripts();

  useEffect(() => {
    if (!scriptsLoaded || !containerRef.current) return;

    const WIDTH = containerRef.current.clientWidth;
    const HEIGHT = containerRef.current.clientHeight;

    // Scene Setup
    const scene = new window.THREE.Scene();
    scene.background = new window.THREE.Color(0xf9fafb); // Tailwind gray-50
    // Add some fog for depth
    scene.fog = new window.THREE.Fog(0xf9fafb, 10, 50);

    // Camera
    const camera = new window.THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 10;
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    containerRef.current.innerHTML = ''; // Clear previous
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new window.THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Object Holder
    let currentMesh = null;
    let frameId = null;

    // Helper to center and scale object
    const setupMesh = (mesh) => {
        if (currentMesh) {
            scene.remove(currentMesh);
        }
        
        // Material - Product Design Aesthetic (Matte White/Grey)
        const material = new window.THREE.MeshStandardMaterial({ 
            color: 0xe5e7eb, 
            roughness: 0.6,
            metalness: 0.1
        });
        
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Centering
        const box = new window.THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new window.THREE.Vector3());
        const size = box.getSize(new window.THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim; // Scale to fit view
        
        mesh.scale.set(scale, scale, scale);
        mesh.position.x = -center.x * scale;
        mesh.position.y = -center.y * scale;
        mesh.position.z = -center.z * scale;
        
        // Add subtle rotation group
        const group = new window.THREE.Group();
        group.add(mesh);
        scene.add(group);
        currentMesh = group;
    };

    // Load Content
    if (stlFile) {
        const loader = new window.THREE.STLLoader();
        const reader = new FileReader();
        reader.onload = (e) => {
            const contents = e.target.result;
            const geometry = loader.parse(contents);
            const mesh = new window.THREE.Mesh(geometry);
            setupMesh(mesh);
        };
        reader.readAsArrayBuffer(stlFile);
    } else {
        // Default Abstract Shape (Torus Knot)
        const geometry = new window.THREE.TorusKnotGeometry(4, 1.2, 128, 32);
        const mesh = new window.THREE.Mesh(geometry);
        setupMesh(mesh);
    }

    // Animation Loop
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (currentMesh) {
          currentMesh.rotation.y += 0.005;
          currentMesh.rotation.x += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
        if (!containerRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleResize);
        if (containerRef.current) containerRef.current.innerHTML = '';
        renderer.dispose();
    };
  }, [scriptsLoaded, stlFile]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />
  );
};

/**
 * DATA: Portfolio Projects from PDF
 */
const projects = [
    {
        id: 'cnc',
        category: 'Engineering',
        title: 'Custom CNC Machine',
        subtitle: 'University of Toronto',
        description: 'Large-format 3-axis CNC router with 229 parts and 400+ mates. Designed for modularity and repairability using a mix of custom and off-the-shelf components.',
        tags: ['SolidWorks', 'Mechatronics', 'Design for Assembly'],
        outcome: 'Comprehensive design report and full BOM generation.',
        icon: <Cpu className="w-6 h-6" />
    },
    {
        id: 'ir-holder',
        category: 'Engineering',
        title: 'IR Camera Holder',
        subtitle: 'LEMAM',
        description: 'Adjustable lens mount and fixture for a $27,000 IR camera. Features a custom cap with standard Sony threads and a linear guide mount.',
        tags: ['Precision Design', '3D Printing', 'Fixture Design'],
        outcome: 'Achieved <2mm wobble and 50mm+ Z-axis travel.',
        icon: <Cpu className="w-6 h-6" />
    },
    {
        id: 'chess-board',
        category: 'Engineering',
        title: 'LED Embedded Chess Board',
        subtitle: 'Spark! Design Team',
        description: 'Ultra-thin (7.7mm) chessboard with 1024+ embedded LEDs. Engineered to prevent light bleed between squares while maintaining structural integrity.',
        tags: ['Electronics', 'OnShape', 'Firmware', 'FastLED'],
        outcome: 'Successfully manufactured with minimal deflection.',
        icon: <Cpu className="w-6 h-6" />
    },
    {
        id: 'keyboard',
        category: 'Creative',
        title: '3x3 Custom Keyboard',
        subtitle: 'Personal Project',
        description: 'Macro-pad designed to optimize SolidWorks workflow. Features a 3D-printed enclosure, OLED screen, rotary encoder, and custom PCB.',
        tags: ['KiCad', 'PCB Design', 'Firmware', 'Product Design'],
        outcome: '39+ programmable functions in a compact form factor.',
        icon: <PenTool className="w-6 h-6" />
    },
    {
        id: 'frame',
        category: 'Creative',
        title: 'Smart Digital Frame',
        subtitle: 'Personal Project',
        description: 'A dual-purpose digital photo frame and external monitor. Built with a Raspberry Pi, custom woodworking, and Python scripts for automation.',
        tags: ['Python', 'Woodworking', 'IoT', 'Raspberry Pi'],
        outcome: 'Seamless integration of tech into home decor.',
        icon: <PenTool className="w-6 h-6" />
    },
    {
        id: 'airpods',
        category: 'Creative',
        title: 'AirPods Dock',
        subtitle: 'Personal Project',
        description: 'Print-in-place charging dock mechanism designed for intuitive use. Maximizes access speed and ensures reliable charging contact.',
        tags: ['Mechanism Design', 'Rapid Prototyping', 'Thingiverse'],
        outcome: 'Open-sourced design available on Thingiverse.',
        icon: <PenTool className="w-6 h-6" />
    },
    {
        id: 'chess-pieces',
        category: 'Creative',
        title: 'Poly Chess Pieces',
        subtitle: 'Spark! Design Team',
        description: 'Low-poly aesthetic chess pieces designed to house internal magnets. Utilized a Blender-to-SolidWorks workflow for organic yet technical modeling.',
        tags: ['Blender', 'Surface Modelling', 'Rendering'],
        outcome: 'Marketing renders and functional magnetic prototypes.',
        icon: <PenTool className="w-6 h-6" />
    },
     {
        id: 'hair-dryer',
        category: 'Creative',
        title: 'Hair Dryer Holder',
        subtitle: 'Personal Project',
        description: 'Minimalist bathroom organizer designed for support-free 3D printing. Optimized for material usage and print speed.',
        tags: ['Consumer Goods', 'FDM Printing', 'Optimization'],
        outcome: '47+ likes on Thingiverse.',
        icon: <PenTool className="w-6 h-6" />
    },
];

const ResumeSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="flex justify-between items-start mb-8 border-b pb-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Alec Chen</h2>
                <p className="text-gray-600 text-lg">Mechanical Engineer | University of Toronto</p>
            </div>
            <div className="text-right text-sm text-gray-500">
                <p>thealec.chen@mail.utoronto.ca</p>
                <p>+1 (778)-991-6826</p>
                <p>Toronto, ON</p>
            </div>
        </div>

        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Experience</h3>
                </div>
                <div className="md:col-span-3 space-y-4">
                    <div>
                        <div className="flex justify-between">
                            <h4 className="font-bold text-gray-900">Mechanical Engineer</h4>
                            <span className="text-gray-500 text-sm">Present</span>
                        </div>
                        <p className="text-gray-600">University of Toronto</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Skills</h3>
                </div>
                <div className="md:col-span-3">
                    <div className="flex flex-wrap gap-2">
                        {['SolidWorks', 'OnShape', 'KiCad', 'Python', 'C++', '3D Printing', 'PCB Design', 'Blender', 'Rapid Prototyping'].map(skill => (
                            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Education</h3>
                </div>
                <div className="md:col-span-3">
                    <h4 className="font-bold text-gray-900">University of Toronto</h4>
                    <p className="text-gray-600">Mechanical Engineering</p>
                </div>
            </div>
        </div>
        
        <div className="mt-8 pt-4 border-t text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2">
                Download Full PDF <ExternalLink size={16} />
            </button>
        </div>
    </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeSection, setActiveSection] = useState('home');
  const [uploadedStl, setUploadedStl] = useState(null);
  const fileInputRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const engineeringProjects = projects.filter(p => p.category === 'Engineering');
  const creativeProjects = projects.filter(p => p.category === 'Creative');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
             setUploadedStl(e.target.result);
        };
        reader.readAsArrayBuffer(file);
    }
  };

  const NavLink = ({ to, label }) => (
    <button 
        onClick={() => {
            setActiveSection(to);
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`text-sm font-medium transition-colors ${activeSection === to ? 'text-blue-600' : 'text-gray-600 hover:text-black'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-600" />
            <span>ALEC CHEN</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="home" label="Home" />
            <NavLink to="portfolio" label="Portfolio" />
            <NavLink to="resume" label="Resume" />
            <NavLink to="contact" label="Contact" />
          </div>

          {/* Mobile Nav Toggle */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
             <div className="md:hidden absolute w-full bg-white border-b px-6 py-4 flex flex-col gap-4 shadow-lg">
                <NavLink to="home" label="Home" />
                <NavLink to="portfolio" label="Portfolio" />
                <NavLink to="resume" label="Resume" />
                <NavLink to="contact" label="Contact" />
             </div>
        )}
      </nav>

      {/* Main Content Router */}
      <main className="pt-16">
        
        {/* SECTION: HOME */}
        {activeSection === 'home' && (
            <div className="relative">
                {/* Hero / 3D Viewer */}
                <div className="h-[80vh] w-full relative overflow-hidden bg-gray-50 flex items-center justify-center">
                    
                    {/* 3D Background */}
                    <ThreeCanvas stlFile={uploadedStl} />
                    
                    {/* Hero Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-center items-start max-w-6xl mx-auto px-6 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 pointer-events-auto max-w-lg">
                            <span className="text-blue-600 font-semibold tracking-wider text-sm mb-2 block">MECHANICAL ENGINEER</span>
                            <h1 className="text-5xl font-bold mb-4 text-gray-900 tracking-tight leading-tight">
                                Designing for <br/> <span className="text-gray-400">Function & Form.</span>
                            </h1>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                I bridge the gap between complex engineering systems and intuitive user experiences. 
                                Based in Toronto, visualizing ideas in 3D.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setActiveSection('portfolio')}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                                >
                                    View Projects
                                </button>
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <Upload size={18} />
                                    Visualize STL
                                </button>
                                <input 
                                    type="file" 
                                    accept=".stl" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                />
                            </div>
                            {uploadedStl && (
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Custom STL Loaded
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Scroll Hint */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400">
                       <ChevronRight className="rotate-90 w-6 h-6" />
                    </div>
                </div>

                {/* About Teaser */}
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-8">About Me</h2>
                        <p className="text-xl text-gray-600 leading-relaxed font-light">
                            I am a mechanical engineer at the University of Toronto with a passion for product design and rapid prototyping.
                            Whether it's a precision fixture for a $27,000 camera or a custom keyboard for my desk, 
                            I apply the same level of rigorous detail and creativity.
                        </p>
                    </div>
                </section>
            </div>
        )}

        {/* SECTION: PORTFOLIO */}
        {activeSection === 'portfolio' && (
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Selected Works</h1>
                        <p className="text-gray-500">A curation of engineering challenges and creative explorations.</p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <button 
                            onClick={() => setActiveTab('all')} 
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setActiveTab('eng')} 
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'eng' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Engineering
                        </button>
                        <button 
                            onClick={() => setActiveTab('creative')} 
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'creative' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Creative
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(activeTab === 'all' || activeTab === 'eng') && engineeringProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                    {(activeTab === 'all' || activeTab === 'creative') && creativeProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        )}

        {/* SECTION: RESUME */}
        {activeSection === 'resume' && (
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold">Resume</h1>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                        <FileText size={20} />
                        Download PDF
                    </button>
                </div>
                <ResumeSection />
            </div>
        )}

        {/* SECTION: CONTACT */}
        {activeSection === 'contact' && (
            <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-4xl mx-auto px-6 text-center">
                <h1 className="text-5xl font-bold mb-8">Let's Build Something.</h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl">
                    I'm currently looking for opportunities in product design and mechanical engineering. 
                    If you have a project in mind or just want to chat about custom keyboards, feel free to reach out.
                </p>
                
                <div className="flex flex-col md:flex-row gap-6 mb-16">
                    <a href="mailto:thealec.chen@mail.utoronto.ca" className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all hover:-translate-y-1 shadow-lg">
                        <Mail />
                        Email Me
                    </a>
                    <a href="https://linkedin.com/in/thealecchen" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-sm">
                        <Linkedin />
                        LinkedIn
                    </a>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-sm">
                        <Github />
                        GitHub
                    </a>
                </div>
            </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 bg-gray-50 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Alec Chen. Designed & Built with React & Three.js.</p>
      </footer>

    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const ProjectCard = ({ project }) => (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        {/* Placeholder for project image - In a real app, this would be project.imageUrl */}
        <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="text-gray-300 group-hover:text-blue-500 transition-colors duration-500 transform group-hover:scale-110">
                {project.icon}
            </div>
            
            <div className="absolute bottom-3 left-3">
                 <span className={`text-xs font-bold px-2 py-1 rounded bg-white/80 backdrop-blur-sm border border-gray-100 ${project.category === 'Engineering' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {project.category}
                </span>
            </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                    {project.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                    {project.subtitle}
                </p>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                {project.description}
            </p>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100">
                            {tag}
                        </span>
                    ))}
                </div>
                
                <div className="pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-900">
                        <span className="text-gray-400 font-normal">Outcome: </span> 
                        {project.outcome}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

export default App;