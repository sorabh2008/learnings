#!/usr/bin/env node

import { Project, SourceFile, ClassDeclaration, InterfaceDeclaration } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

interface AnalysisResult {
  projectName: string;
  totalFiles: number;
  totalLines: number;
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  functions: FunctionInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  dependencies: DependencyGraph;
  codeMetrics: CodeMetrics;
}

interface ClassInfo {
  name: string;
  file: string;
  isExported: boolean;
  isAbstract: boolean;
  methods: MethodInfo[];
  properties: PropertyInfo[];
  extends?: string;
  implements: string[];
}

interface InterfaceInfo {
  name: string;
  file: string;
  isExported: boolean;
  properties: PropertyInfo[];
  methods: MethodInfo[];
}

interface FunctionInfo {
  name: string;
  file: string;
  isExported: boolean;
  isAsync: boolean;
  parameters: ParameterInfo[];
  returnType: string;
}

interface MethodInfo {
  name: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isAsync: boolean;
  returnType: string;
}

interface PropertyInfo {
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  isReadonly: boolean;
}

interface ParameterInfo {
  name: string;
  type: string;
  isOptional: boolean;
}

interface ImportInfo {
  from: string;
  imports: string[];
  file: string;
  isDefault: boolean;
}

interface ExportInfo {
  name: string;
  file: string;
  type: 'class' | 'interface' | 'function' | 'variable' | 'type';
}

interface DependencyGraph {
  [fileName: string]: string[];
}

interface CodeMetrics {
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  duplicateCodeBlocks: number;
  unusedExports: string[];
  circularDependencies: string[][];
}

class RepositoryAnalyzer {
  private project: Project;
  private sourceFiles: SourceFile[] = [];

  constructor(repoPath: string) {
    this.project = new Project({
      // Try to use existing tsconfig.json, fallback to default settings
      tsConfigFilePath: this.findTsConfig(repoPath),
      compilerOptions: {
        allowJs: true,
        declaration: true,
        emitDeclarationOnly: true,
        target: 99, // Latest
      },
    });

    // Add all TypeScript/JavaScript files
    this.addSourceFiles(repoPath);
  }

  private findTsConfig(repoPath: string): string | undefined {
    const tsConfigPath = path.join(repoPath, "tsconfig.json");
    return fs.existsSync(tsConfigPath) ? tsConfigPath : undefined;
  }

  private addSourceFiles(repoPath: string) {
    const patterns = [
      `${repoPath}/src/**/*.{ts,tsx,js,jsx}`,
      `${repoPath}/lib/**/*.{ts,tsx,js,jsx}`,
      `${repoPath}/components/**/*.{ts,tsx,js,jsx}`,
      `${repoPath}/pages/**/*.{ts,tsx,js,jsx}`,
      `${repoPath}/utils/**/*.{ts,tsx,js,jsx}`,
      `${repoPath}/**/*.{ts,tsx,js,jsx}`, // Fallback for any structure
    ];

    for (const pattern of patterns) {
      try {
        this.project.addSourceFilesAtPaths(pattern);
      } catch (error) {
        // Pattern might not match any files, continue
      }
    }

    // Exclude node_modules and build directories
    this.sourceFiles = this.project.getSourceFiles().filter(file => {
      const filePath = file.getFilePath();
      return !filePath.includes("node_modules") && 
             !filePath.includes("dist") && 
             !filePath.includes("build");
    });

    console.log(`Found ${this.sourceFiles.length} source files to analyze`);
  }

  public async analyzeRepository(): Promise<AnalysisResult> {
    console.log("🔍 Starting repository analysis...");
    
    const result: AnalysisResult = {
      projectName: this.getProjectName(),
      totalFiles: this.sourceFiles.length,
      totalLines: this.getTotalLines(),
      classes: this.analyzeClasses(),
      interfaces: this.analyzeInterfaces(),
      functions: this.analyzeFunctions(),
      imports: this.analyzeImports(),
      exports: this.analyzeExports(),
      dependencies: this.buildDependencyGraph(),
      codeMetrics: this.calculateMetrics(),
    };

    console.log("✅ Analysis complete!");
    return result;
  }

  private getProjectName(): string {
    // Try to get from package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      return packageJson.name || "Unknown Project";
    } catch {
      return path.basename(process.cwd());
    }
  }

  private getTotalLines(): number {
    return this.sourceFiles.reduce((total, file) => {
      return total + file.getFullText().split('\n').length;
    }, 0);
  }

  private analyzeClasses(): ClassInfo[] {
    const classes: ClassInfo[] = [];
    
    this.sourceFiles.forEach(file => {
      file.getClasses().forEach(cls => {
        const classInfo: ClassInfo = {
          name: cls.getName() || "Anonymous",
          file: this.getRelativePath(file.getFilePath()),
          isExported: cls.isExported(),
          isAbstract: cls.isAbstract(),
          methods: this.getMethodInfo(cls),
          properties: this.getPropertyInfo(cls),
          extends: cls.getExtends()?.getText(),
          implements: cls.getImplements().map(impl => impl.getText()),
        };
        classes.push(classInfo);
      });
    });

    return classes;
  }

  private analyzeInterfaces(): InterfaceInfo[] {
    const interfaces: InterfaceInfo[] = [];
    
    this.sourceFiles.forEach(file => {
      file.getInterfaces().forEach(iface => {
        const interfaceInfo: InterfaceInfo = {
          name: iface.getName(),
          file: this.getRelativePath(file.getFilePath()),
          isExported: iface.isExported(),
          properties: iface.getProperties().map(prop => ({
            name: prop.getName(),
            type: prop.getTypeNode()?.getText() || "any",
            visibility: "public" as const,
            isReadonly: prop.isReadonly(),
          })),
          methods: iface.getMethods().map(method => ({
            name: method.getName(),
            visibility: "public" as const,
            isStatic: false,
            isAsync: method.hasModifier("async"),
            returnType: method.getReturnTypeNode()?.getText() || "any",
          })),
        };
        interfaces.push(interfaceInfo);
      });
    });

    return interfaces;
  }

  private analyzeFunctions(): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    
    this.sourceFiles.forEach(file => {
      file.getFunctions().forEach(func => {
        const functionInfo: FunctionInfo = {
          name: func.getName() || "anonymous",
          file: this.getRelativePath(file.getFilePath()),
          isExported: func.isExported(),
          isAsync: func.isAsync(),
          parameters: func.getParameters().map(param => ({
            name: param.getName(),
            type: param.getTypeNode()?.getText() || "any",
            isOptional: param.hasQuestionToken(),
          })),
          returnType: func.getReturnTypeNode()?.getText() || "any",
        };
        functions.push(functionInfo);
      });
    });

    return functions;
  }

  private analyzeImports(): ImportInfo[] {
    const imports: ImportInfo[] = [];
    
    this.sourceFiles.forEach(file => {
      file.getImportDeclarations().forEach(importDecl => {
        const importInfo: ImportInfo = {
          from: importDecl.getModuleSpecifierValue(),
          imports: importDecl.getNamedImports().map(imp => imp.getName()),
          file: this.getRelativePath(file.getFilePath()),
          isDefault: !!importDecl.getDefaultImport(),
        };
        imports.push(importInfo);
      });
    });

    return imports;
  }

  private analyzeExports(): ExportInfo[] {
    const exports: ExportInfo[] = [];
    
    this.sourceFiles.forEach(file => {
      const filePath = this.getRelativePath(file.getFilePath());
      
      // Classes
      file.getClasses().filter(cls => cls.isExported()).forEach(cls => {
        exports.push({
          name: cls.getName() || "Anonymous",
          file: filePath,
          type: "class",
        });
      });

      // Interfaces
      file.getInterfaces().filter(iface => iface.isExported()).forEach(iface => {
        exports.push({
          name: iface.getName(),
          file: filePath,
          type: "interface",
        });
      });

      // Functions
      file.getFunctions().filter(func => func.isExported()).forEach(func => {
        exports.push({
          name: func.getName() || "anonymous",
          file: filePath,
          type: "function",
        });
      });
    });

    return exports;
  }

  private buildDependencyGraph(): DependencyGraph {
    const graph: DependencyGraph = {};
    
    this.sourceFiles.forEach(file => {
      const filePath = this.getRelativePath(file.getFilePath());
      const dependencies: string[] = [];
      
      file.getImportDeclarations().forEach(importDecl => {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();
        // Only track relative imports (internal dependencies)
        if (moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../')) {
          dependencies.push(moduleSpecifier);
        }
      });
      
      graph[filePath] = dependencies;
    });

    return graph;
  }

  private calculateMetrics(): CodeMetrics {
    // Simplified metrics calculation
    return {
      cyclomaticComplexity: this.calculateCyclomaticComplexity(),
      maintainabilityIndex: 85, // Placeholder
      duplicateCodeBlocks: 0, // Would need more sophisticated analysis
      unusedExports: this.findUnusedExports(),
      circularDependencies: this.findCircularDependencies(),
    };
  }

  private calculateCyclomaticComplexity(): number {
    let totalComplexity = 0;
    
    this.sourceFiles.forEach(file => {
      file.getFunctions().forEach(func => {
        let complexity = 1; // Base complexity
        
        // Count decision points
        func.getDescendantsOfKind(298).forEach(() => complexity++); // IfStatement
        func.getDescendantsOfKind(247).forEach(() => complexity++); // WhileStatement  
        func.getDescendantsOfKind(248).forEach(() => complexity++); // ForStatement
        func.getDescendantsOfKind(292).forEach(() => complexity++); // ConditionalExpression
        
        totalComplexity += complexity;
      });
    });

    return totalComplexity;
  }

  private findUnusedExports(): string[] {
    const exports = this.analyzeExports();
    const imports = this.analyzeImports();
    
    const usedExports = new Set(
      imports.flatMap(imp => imp.imports)
    );

    return exports
      .filter(exp => !usedExports.has(exp.name))
      .map(exp => `${exp.name} in ${exp.file}`);
  }

  private findCircularDependencies(): string[][] {
    // Simplified circular dependency detection
    const graph = this.buildDependencyGraph();
    const circular: string[][] = [];
    
    // This would need a more sophisticated graph traversal algorithm
    // For now, return empty array
    return circular;
  }

  private getMethodInfo(cls: ClassDeclaration): MethodInfo[] {
    return cls.getMethods().map(method => ({
      name: method.getName(),
      visibility: method.hasModifier("private") ? "private" : 
                  method.hasModifier("protected") ? "protected" : "public",
      isStatic: method.isStatic(),
      isAsync: method.isAsync(),
      returnType: method.getReturnTypeNode()?.getText() || "any",
    }));
  }

  private getPropertyInfo(cls: ClassDeclaration): PropertyInfo[] {
    return cls.getProperties().map(prop => ({
      name: prop.getName(),
      type: prop.getTypeNode()?.getText() || "any",
      visibility: prop.hasModifier("private") ? "private" : 
                  prop.hasModifier("protected") ? "protected" : "public",
      isReadonly: prop.isReadonly(),
    }));
  }

  private getRelativePath(fullPath: string): string {
    return path.relative(process.cwd(), fullPath);
  }

  public generateReport(analysis: AnalysisResult): string {
    return `
# Repository Analysis Report: ${analysis.projectName}

## Overview
- **Total Files**: ${analysis.totalFiles}
- **Total Lines**: ${analysis.totalLines}
- **Classes**: ${analysis.classes.length}
- **Interfaces**: ${analysis.interfaces.length}
- **Functions**: ${analysis.functions.length}

## Code Metrics
- **Cyclomatic Complexity**: ${analysis.codeMetrics.cyclomaticComplexity}
- **Maintainability Index**: ${analysis.codeMetrics.maintainabilityIndex}
- **Unused Exports**: ${analysis.codeMetrics.unusedExports.length}

## Classes
${analysis.classes.map(cls => `
### ${cls.name} ${cls.isExported ? '(exported)' : '(internal)'}
- **File**: ${cls.file}
- **Methods**: ${cls.methods.length}
- **Properties**: ${cls.properties.length}
${cls.extends ? `- **Extends**: ${cls.extends}` : ''}
${cls.implements.length > 0 ? `- **Implements**: ${cls.implements.join(', ')}` : ''}
`).join('')}

## Interfaces
${analysis.interfaces.map(iface => `
### ${iface.name}
- **File**: ${iface.file}
- **Properties**: ${iface.properties.length}
- **Methods**: ${iface.methods.length}
`).join('')}

## Dependency Graph
${Object.entries(analysis.dependencies).map(([file, deps]) => 
  `- **${file}**: depends on ${deps.length} modules`
).join('\n')}

## Unused Exports
${analysis.codeMetrics.unusedExports.map(exp => `- ${exp}`).join('\n')}
`;
  }
}

// Usage example
async function analyzeWorkPoolRepo() {
  console.log("🚀 Analyzing WorkPool repository...");
  

  const analyzer = new RepositoryAnalyzer("./");
  
  try {
    const analysis = await analyzer.analyzeRepository();
    const report = analyzer.generateReport(analysis);
    
    // Save report to file
    fs.writeFileSync("workpool-analysis.md", report);
    
    console.log("📊 Analysis Results:");
    console.log(`- Found ${analysis.classes.length} classes`);
    console.log(`- Found ${analysis.interfaces.length} interfaces`);
    console.log(`- Found ${analysis.functions.length} functions`);
    console.log(`- Total lines of code: ${analysis.totalLines}`);
    console.log("\n📄 Full report saved to workpool-analysis.md");
    
    return analysis;
  } catch (error) {
    console.error("❌ Analysis failed:", error);
    throw error;
  }
}

// Export for use as module
export { RepositoryAnalyzer, AnalysisResult };

// Run if called directly
if (require.main === module) {
  analyzeWorkPoolRepo().catch(console.error);
}
