/**
 * Domain-Driven Architecture Diagram Generator
 * Organizes applications by Domain > Sub-domain structure with technology icons
 */

class DomainDrivenMermaidGenerator {
    constructor() {
        this.nodeCounter = 1;
        this.domains = new Map();
        
        // Technology-specific icons
        this.techIcons = {
            // Frontend Technologies
            'react': '⚛️',
            'reactnative': '📱',
            'vue': '💚',
            'angular': '🔺',
            'svelte': '🧡',
            'nextjs': '▲',
            'flutter': '💙',
            'swift': '🍎',
            'kotlin': '📱',
            
            // Backend Technologies
            'java': '☕',
            'spring': '☕',
            'springboot': '☕',
            'nodejs': '🟢',
            'node': '🟢',
            'python': '🐍',
            'fastapi': '🐍',
            'django': '🐍',
            'dotnet': '🔷',
            'csharp': '🔷',
            'go': '🦕',
            'golang': '🦕',
            'rust': '🦀',
            'ruby': '💎',
            'rails': '💎',
            'php': '🐘',
            'laravel': '🐘',
            
            // Databases
            'postgresql': '🐘',
            'postgres': '🐘',
            'mysql': '🐬',
            'mongodb': '🍃',
            'redis': '🔴',
            'elasticsearch': '🔍',
            'cassandra': '🔗',
            'dynamodb': '⚡',
            'neo4j': '🕸️',
            
            // Cloud Platforms
            'aws': '☁️',
            'azure': '☁️',
            'gcp': '☁️',
            'googlecloud': '☁️',
            'kubernetes': '⎈',
            'docker': '🐳',
            
            // Message Queues & Streaming
            'kafka': '🌊',
            'rabbitmq': '🐰',
            'activemq': '📨',
            'pulsar': '⚡',
            'eventbridge': '🌉',
            
            // Default
            'api': '🔌',
            'service': '⚙️',
            'external': '🌐',
            'database': '🗄️',
            'webapp': '💻',
            'mobile': '📱'
        };
        
        // Connection styles for different interaction types
        this.connectionStyles = {
            synchronous: '==>',
            asynchronous: '-.->',
            event: '==>',
            data: '-.->',
            api: '==>',
            messaging: '-.->',
        };
        
        // Domain-specific colors
        this.domainColors = {
            customer: { fill: '#e8f5e8', stroke: '#2e7d32', textColor: '#1b5e20' },
            payment: { fill: '#e3f2fd', stroke: '#1976d2', textColor: '#0d47a1' },
            order: { fill: '#fff8e1', stroke: '#f57c00', textColor: '#e65100' },
            inventory: { fill: '#fce4ec', stroke: '#c2185b', textColor: '#880e4f' },
            communication: { fill: '#fff3e0', stroke: '#ff9800', textColor: '#e65100' },
            analytics: { fill: '#f3e5f5', stroke: '#9c27b0', textColor: '#6a1b9a' },
            security: { fill: '#ffebee', stroke: '#f44336', textColor: '#c62828' },
            shared: { fill: '#f5f5f5', stroke: '#757575', textColor: '#424242' },
            infrastructure: { fill: '#e0f2f1', stroke: '#00695c', textColor: '#004d40' },
            external: { fill: '#ffebee', stroke: '#d32f2f', textColor: '#c62828' }
        };
    }

    getTechIcon(technology) {
        if (!technology) return this.techIcons.service;
        
        const tech = technology.toLowerCase().replace(/[\s-_.]/g, '');
        return this.techIcons[tech] || this.techIcons.service;
    }

    getTechStack(technologies) {
        if (!technologies || technologies.length === 0) return '';
        
        // Handle single technology or array
        const techArray = Array.isArray(technologies) ? technologies : [technologies];
        return techArray.map(tech => this.getTechIcon(tech)).join(' + ');
    }

    createDomainStructure(appsData) {
        // Reset domains
        this.domains.clear();
        
        appsData.forEach(app => {
            const domainName = app.domain || 'shared';
            const subDomainName = app.subDomain || 'core';
            
            // Initialize domain structure
            if (!this.domains.has(domainName)) {
                this.domains.set(domainName, new Map());
            }
            
            // Initialize sub-domain
            if (!this.domains.get(domainName).has(subDomainName)) {
                this.domains.get(domainName).set(subDomainName, []);
            }
            
            // Create enhanced node
            const node = this.createEnhancedDomainNode(app);
            this.domains.get(domainName).get(subDomainName).push(node);
        });
    }

    createEnhancedDomainNode(app) {
        const techStack = this.getTechStack(app.technology);
        const nodeId = this.generateCleanNodeId(app.appID);
        
        return {
            id: nodeId,
            appId: app.appID,
            name: app.appName,
            domain: app.domain || 'shared',
            subDomain: app.subDomain || 'core',
            technology: app.technology,
            techStack: techStack,
            description: app.description || this.generateDescription(app.appName),
            epic: app.epic || null,
            consumes: app.consumes || [],
            connectionType: app.connectionType || 'synchronous'
        };
    }

    generateCleanNodeId(appId) {
        return appId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }

    generateDescription(appName) {
        const descriptions = {
            'portal': 'User Interface',
            'service': 'Business Logic',
            'api': 'API Gateway',
            'gateway': 'Integration Layer',
            'processor': 'Data Processing',
            'engine': 'Processing Engine',
            'manager': 'Resource Management',
            'handler': 'Event Processing',
            'scheduler': 'Task Scheduling',
            'monitor': 'System Monitoring',
            'analyzer': 'Data Analysis'
        };
        
        const name = appName.toLowerCase();
        for (const [key, desc] of Object.entries(descriptions)) {
            if (name.includes(key)) return desc;
        }
        
        return 'Application Service';
    }

    generateDomainMermaid(appsData, options = {}) {
        const {
            filterByEpic = null,
            filterByDomain = null,
            showTechnology = true,
            showConnections = true,
            diagramTitle = "Domain-Driven Enterprise Architecture",
            layoutDirection = "TD"
        } = options;

        // Create domain structure
        this.createDomainStructure(appsData);
        
        // Create node lookup for connections
        const nodeMap = new Map();
        appsData.forEach(app => {
            const node = this.createEnhancedDomainNode(app);
            nodeMap.set(app.appID, node);
        });

        let mermaid = `graph ${layoutDirection}\n`;
        mermaid += `    %% ${diagramTitle}\n\n`;

        // Generate domain subgraphs
        for (const [domainName, subDomains] of this.domains.entries()) {
            // Apply domain filter if specified
            if (filterByDomain && domainName !== filterByDomain) continue;
            
            const domainIcon = this.getDomainIcon(domainName);
            const domainTitle = `${domainIcon} ${this.formatDomainName(domainName)} Domain`;
            
            mermaid += `    %% ===== ${domainTitle.toUpperCase()} =====\n`;
            mermaid += `    subgraph ${domainName.toUpperCase()}["${domainTitle}"]\n`;
            mermaid += `        direction TB\n\n`;

            // Generate sub-domain subgraphs
            for (const [subDomainName, apps] of subDomains.entries()) {
                // Filter by Epic if specified
                const filteredApps = filterByEpic ? 
                    apps.filter(app => app.epic === filterByEpic) : apps;
                
                if (filteredApps.length === 0) continue;

                const subDomainTitle = this.formatSubDomainName(subDomainName);
                
                mermaid += `        subgraph ${domainName.toUpperCase()}_${subDomainName.toUpperCase()}["${subDomainTitle} (Sub-domain)"]\n`;
                mermaid += `            direction LR\n`;

                // Generate nodes for this sub-domain
                filteredApps.forEach(app => {
                    mermaid += `            ${this.formatDomainNode(app, showTechnology)}\n`;
                });

                mermaid += `        end\n\n`;
            }

            mermaid += `    end\n\n`;
        }

        // Generate connections if enabled
        if (showConnections) {
            mermaid += this.generateDomainConnections(appsData, nodeMap, filterByEpic, filterByDomain);
        }

        // Add enhanced domain-based styling
        mermaid += this.generateDomainStyling();

        return mermaid;
    }

    getDomainIcon(domainName) {
        const icons = {
            customer: '🛍️',
            payment: '💰',
            order: '📦',
            inventory: '📋',
            communication: '📨',
            analytics: '📊',
            security: '🔒',
            shared: '🔧',
            infrastructure: '🏗️',
            external: '🌐'
        };
        
        return icons[domainName.toLowerCase()] || '⚙️';
    }

    formatDomainName(domainName) {
        return domainName.charAt(0).toUpperCase() + domainName.slice(1);
    }

    formatSubDomainName(subDomainName) {
        return subDomainName.split(/[-_\s]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatDomainNode(app, showTechnology) {
        const techDisplay = showTechnology && app.techStack ? 
            `<br/>${app.techStack}` : '';
        
        const nodeContent = `${app.name}${techDisplay}<br/>🆔 ${app.appId}<br/><small>${app.description}</small>`;
        
        return `${app.id}[${nodeContent}]`;
    }

    generateDomainConnections(appsData, nodeMap, filterByEpic, filterByDomain) {
        let connections = `    %% ===== DOMAIN CONNECTIONS =====\n`;
        
        appsData.forEach(app => {
            const sourceNode = nodeMap.get(app.appID);
            if (!sourceNode) return;
            
            // Apply filters
            if (filterByEpic && sourceNode.epic !== filterByEpic) return;
            if (filterByDomain && sourceNode.domain !== filterByDomain) return;
            
            if (app.consumes) {
                app.consumes.forEach(consumed => {
                    const targetNode = nodeMap.get(consumed.appId);
                    if (!targetNode) return;
                    
                    // Apply filters to target as well
                    if (filterByEpic && targetNode.epic !== filterByEpic) return;
                    if (filterByDomain && targetNode.domain !== filterByDomain) return;
                    
                    const connectionStyle = this.determineConnectionStyle(consumed.connectionType || 'synchronous');
                    const label = this.generateConnectionLabel(consumed.functions, consumed.description);
                    
                    if (label) {
                        connections += `    ${sourceNode.id} ${connectionStyle}|"${label}"| ${targetNode.id}\n`;
                    } else {
                        connections += `    ${sourceNode.id} ${connectionStyle} ${targetNode.id}\n`;
                    }
                });
            }
        });
        
        return connections + '\n';
    }

    determineConnectionStyle(connectionType) {
        return this.connectionStyles[connectionType] || this.connectionStyles.synchronous;
    }

    generateConnectionLabel(functions, description) {
        if (!functions || functions.length === 0) return description || '';
        
        const funcIcons = {
            'create': '📝',
            'get': '🔍',
            'update': '✏️',
            'delete': '🗑️',
            'send': '📤',
            'receive': '📥',
            'process': '⚙️',
            'authenticate': '🔐',
            'authorize': '🔑',
            'validate': '✅',
            'transform': '🔄',
            'aggregate': '📊'
        };
        
        const labelParts = functions.map(func => {
            const icon = funcIcons[func.toLowerCase()] || '•';
            return `${icon} ${func}`;
        });
        
        const funcLabel = labelParts.join('<br/>');
        return description ? `${funcLabel}<br/>${description}` : funcLabel;
    }

    generateDomainStyling() {
        let styling = `    %% ===== ENHANCED DOMAIN STYLING =====\n`;
        
        // Generate class definitions for each domain
        Object.entries(this.domainColors).forEach(([domain, colors]) => {
            styling += `    classDef ${domain}Domain fill:${colors.fill},stroke:${colors.stroke},stroke-width:3px,color:${colors.textColor},font-weight:bold\n`;
        });
        
        // Apply styles to domains
        for (const [domainName, subDomains] of this.domains.entries()) {
            const nodeIds = [];
            for (const [subDomainName, apps] of subDomains.entries()) {
                apps.forEach(app => nodeIds.push(app.id));
            }
            
            if (nodeIds.length > 0) {
                const domainClass = this.domainColors[domainName.toLowerCase()] ? 
                    `${domainName.toLowerCase()}Domain` : 'sharedDomain';
                styling += `    class ${nodeIds.join(',')} ${domainClass}\n`;
            }
        }
        
        // Subgraph styling
        styling += `\n    %% Subgraph styling\n`;
        styling += `    classDef domainBox fill:#f8f9fa,stroke:#495057,stroke-width:2px,stroke-dasharray: 8 4\n`;
        
        const domainSubgraphs = Array.from(this.domains.keys()).map(d => d.toUpperCase()).join(',');
        if (domainSubgraphs) {
            styling += `    class ${domainSubgraphs} domainBox\n`;
        }
        
        return styling;
    }
}

// Usage Examples with Domain-Driven Structure

const domainGenerator = new DomainDrivenMermaidGenerator();

const enterpriseDomainData = [
    // Customer Domain
    {
        appID: 'WEB001',
        appName: 'Customer Portal',
        domain: 'customer',
        subDomain: 'portal',
        technology: ['React', 'Node.js'],
        description: 'Self-Service Web Interface',
        epic: 'CUSTOMER_EXPERIENCE',
        connectionType: 'synchronous',
        consumes: [
            { 
                appId: 'AUTH001', 
                functions: ['authenticate', 'authorize'],
                description: 'User authentication',
                connectionType: 'synchronous'
            },
            { 
                appId: 'PROF001', 
                functions: ['get', 'update'],
                description: 'Profile management',
                connectionType: 'synchronous'
            }
        ]
    },
    {
        appID: 'MOB001',
        appName: 'Customer Mobile App',
        domain: 'customer',
        subDomain: 'portal',
        technology: 'React Native',
        description: 'iOS/Android Mobile App',
        epic: 'CUSTOMER_EXPERIENCE',
        consumes: [
            { 
                appId: 'AUTH001', 
                functions: ['authenticate'],
                description: 'Mobile authentication',
                connectionType: 'synchronous'
            }
        ]
    },
    {
        appID: 'AUTH001',
        appName: 'Authentication Service',
        domain: 'customer',
        subDomain: 'identity',
        technology: ['Python', 'FastAPI'],
        description: 'Identity & Access Management',
        epic: 'PLATFORM',
        consumes: [
            {
                appId: 'CACHE001',
                functions: ['read', 'write'],
                description: 'Session management',
                connectionType: 'data'
            }
        ]
    },
    {
        appID: 'PROF001',
        appName: 'Profile Service',
        domain: 'customer',
        subDomain: 'profile',
        technology: ['Java', 'Spring Boot'],
        description: 'Customer Data Management',
        epic: 'CUSTOMER_EXPERIENCE',
        consumes: [
            {
                appId: 'DB001',
                functions: ['read', 'write'],
                description: 'Customer data persistence',
                connectionType: 'data'
            }
        ]
    },

    // Payment Domain
    {
        appID: 'PAY001',
        appName: 'Payment Processing Service',
        domain: 'payment',
        subDomain: 'processing',
        technology: ['Java', 'Spring Boot'],
        description: 'Transaction Processing Engine',
        epic: 'PAYMENTS',
        consumes: [
            {
                appId: 'PAYG001',
                functions: ['process', 'validate'],
                description: 'External payment processing',
                connectionType: 'synchronous'
            },
            {
                appId: 'FRAUD001',
                functions: ['check', 'score'],
                description: 'Fraud detection',
                connectionType: 'synchronous'
            },
            {
                appId: 'EMAIL001',
                functions: ['send'],
                description: 'Payment notifications',
                connectionType: 'asynchronous'
            }
        ]
    },
    {
        appID: 'PAYG001',
        appName: 'Payment Gateway',
        domain: 'payment',
        subDomain: 'processing',
        technology: ['.NET Core'],
        description: 'External Gateway Adapter',
        epic: 'PAYMENTS',
        consumes: [
            {
                appId: 'STRIPE001',
                functions: ['charge', 'refund'],
                description: 'Stripe integration',
                connectionType: 'api'
            }
        ]
    },
    {
        appID: 'FRAUD001',
        appName: 'Fraud Detection Service',
        domain: 'payment',
        subDomain: 'compliance',
        technology: ['Python', 'ML'],
        description: 'AI-Powered Risk Assessment',
        epic: 'PAYMENTS'
    },

    // Communication Domain
    {
        appID: 'EMAIL001',
        appName: 'Email Service',
        domain: 'communication',
        subDomain: 'notification',
        technology: 'Node.js',
        description: 'Email Orchestration Service',
        epic: 'PLATFORM',
        consumes: [
            {
                appId: 'SENDGRID001',
                functions: ['send'],
                description: 'Email delivery',
                connectionType: 'api'
            },
            {
                appId: 'MQ001',
                functions: ['publish', 'subscribe'],
                description: 'Message queuing',
                connectionType: 'messaging'
            }
        ]
    },
    {
        appID: 'MQ001',
        appName: 'Message Queue Service',
        domain: 'communication',
        subDomain: 'messaging',
        technology: ['Kafka', 'Go'],
        description: 'Event Streaming Platform',
        epic: 'PLATFORM'
    },

    // Shared Infrastructure
    {
        appID: 'DB001',
        appName: 'Customer Database',
        domain: 'infrastructure',
        subDomain: 'data',
        technology: ['PostgreSQL', 'AWS'],
        description: 'Primary Customer Data Store'
    },
    {
        appID: 'CACHE001',
        appName: 'Cache Service',
        domain: 'infrastructure',
        subDomain: 'data',
        technology: ['Redis', 'AWS'],
        description: 'High-Performance Cache'
    },

    // External Services
    {
        appID: 'STRIPE001',
        appName: 'Stripe Payment API',
        domain: 'external',
        subDomain: 'payment',
        technology: 'REST API',
        description: 'Third-party Payment Processor'
    },
    {
        appID: 'SENDGRID001',
        appName: 'SendGrid Email API',
        domain: 'external',
        subDomain: 'communication',
        technology: 'REST API',
        description: 'Email Delivery Service'
    }
];

// Generate different views
console.log("=== FULL ENTERPRISE DOMAIN ARCHITECTURE ===");
console.log(domainGenerator.generateDomainMermaid(enterpriseDomainData, {
    diagramTitle: "Enterprise Domain-Driven Architecture",
    showTechnology: true,
    showConnections: true
}));

console.log("\n=== CUSTOMER DOMAIN ONLY ===");
console.log(domainGenerator.generateDomainMermaid(enterpriseDomainData, {
    filterByDomain: 'customer',
    diagramTitle: 'Customer Domain Architecture'
}));

console.log("\n=== PAYMENTS EPIC CROSS-DOMAIN VIEW ===");
console.log(domainGenerator.generateDomainMermaid(enterpriseDomainData, {
    filterByEpic: 'PAYMENTS',
    diagramTitle: 'Payments Epic - Cross-Domain View'
}));

module.exports = { DomainDrivenMermaidGenerator };
