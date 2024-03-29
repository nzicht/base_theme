module.exports = function(grunt) {

	grunt.initConfig({
		
		// Reads contents from the node package.json located in the same folder as the
		// gruntfile.js. This allows grunt to access basic information about the
		// applcation.
		pkg: grunt.file.readJSON('package.json'),

		// Reusable banner
		banner: [
		'/*!',
		' * <%= pkg.title || pkg.name %> <%= pkg.version %>',
		' * Author: <%= pkg.author.name %>',
		' * Date: <%= grunt.template.today(\'dd-mm-yyyy\') %>',
		' * Copyright (c) nZicht <%= grunt.template.today(\'yyyy\') %>',
		' */\n\n'
		].join('\n'),

		// Paths for different setups 
		path: {
			buildDir: 'release/<%= pkg.name %> <%= pkg.version %>/',
			devDir: '.'
		},
		
		// Grunt-contrib-concat
		concat: {
			options: {
				separator: '\n',
				banner: '<%= banner %>'
			},
			build: {
				src: ['css/*.less'],
				dest: '<%= path.buildDir %>css/<%= pkg.name %>.less'
			},
			dev: {
				src: ['css/*.less'],
				dest: 'css/<%= pkg.name %>.less'
			}
		},

		// Watches for changes and runs tasks
		watch : {
			sass : {
				files : ['scss/**/*.scss'],
				tasks : ['sass:dev'],
				options : {
					livereload : true
				}
			},
			js : {
				files : ['js/**/*.js'],
				tasks : ['jshint'],
				options : {
					livereload : true
				}
			},
			php : {
				files : ['**/*.php'],
				options : {
					livereload : true
				}
			}
		},

		// JsHint your javascript
		jshint : {
			all : ['js/*.js', '!js/modernizr.js', '!js/*.min.js', '!js/vendor/**/*.js'],
			options : {
				browser: true,
				curly: false,
				eqeqeq: false,
				eqnull: true,
				expr: true,
				immed: true,
				newcap: true,
				noarg: true,
				smarttabs: true,
				sub: true,
				undef: false
			}
		},
		
		// Grunt-contrib-copy
		copy: {
			build: {
				files: [{
					expand: true,
					src: ['*.html', 'favicon.ico', 'package.json', 'component.json', '.bowerrc', '.gitignore', 'style.css', '*.php', 'images/**', 'js/**', 'scss/**'],
					dest: '<%= path.buildDir %>',
					filter: 'isFile'
				}]
			}
		},
		
		// Version number bumping. Use like bump:major (0.5.0 -> 1.0.0), bump:minor
		// (0.5.0 -> 0.6.0) and bump:patch (0.5.0 -> 0.5.1)
		bump: {
			options: {
				files: [ 'package.json' ],
				updateConfigs: [ 'pkg' ],
				commit: false,
				createTag: false,
				push: false
			}
		},

		// Dev and production build for sass
		sass : {
			production : {
				files : [
					{
						src : ['**/*.scss', '!**/_*.scss'],
						cwd : 'scss',
						dest : 'css',
						ext : '.css',
						expand : true
					}
				],
				options : {
					style : 'compressed'
				}
			},
			dev : {
				files : [
					{
						src : ['**/*.scss', '!**/_*.scss'],
						cwd : 'scss',
						dest : 'css',
						ext : '.css',
						expand : true
					}
				],
				options : {
					style : 'expanded'
				}
			}
		},
		
		// Grunt-contrib-less, less compiler
		less: {
			dev: {
				options: {
					paths: [ 'css/' ]
				},
				files: {
					'css/<%= pkg.name %>.min.css': [ 'css/nZicht.less' ]
				}
			},
			build: {
				options: {
					paths: [ 'css/' ],
					yuicompress: true
				},
				files: {
					'<%= path.buildDir %>css/<%= pkg.name %>.min.css': [ 'css/nZicht.less' ]
					'<%= path.buildDir %>style.css': [ 'css/nZicht.less' ]
				}
			}
		},

		// Bower task sets up require config
		bower : {
			all : {
				rjsConfig : 'js/global.js'
			}
		},

		// Require config
		requirejs : {
			production : {
				options : {
					name : 'global',
					baseUrl : 'js',
					mainConfigFile : 'js/global.js',
					out : 'js/optimized.min.js'
				}
			}
		},

		// Image min
		imagemin : {
			production : {
				files : [
					{
						expand: true,
						cwd: 'images',
						src: '**/*.{png,jpg,jpeg}',
						dest: 'images'
					}
				]
			}
		},

		// SVG min
		svgmin: {
			production : {
				files: [
					{
						expand: true,
						cwd: 'images',
						src: '**/*.svg',
						dest: 'images'
					}
				]
			}
		},

	});

	// Default task
	grunt.registerTask('default', ['watch']);

	// Build task
	grunt.registerTask('build', ['jshint', 'sass:production', 'imagemin:production', 'svgmin:production', 'requirejs:production']);

	// Template Setup Task
	grunt.registerTask('setup', ['sass:dev', 'bower-install']);

	// This task is ran by running the "grunt patch" command
	grunt.registerTask('patch', [ 'bump:patch', 'copy:build', 'concat:build', 'uglify:build', 'less:build', 'jshint:build', 'jsdoc']);
	
	// This task is ran by running the "grunt major" command
	grunt.registerTask('major', [ 'bump:major', 'copy:build', 'concat:build', 'uglify:build', 'less:build', 'jshint:build', 'jsdoc']);


	// Load up tasks
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bower-requirejs');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-svgmin');	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bump');

	// Run bower install
	grunt.registerTask('bower-install', function() {
		var done = this.async();
		var bower = require('bower').commands;
		bower.install().on('end', function(data) {
			done();
		}).on('data', function(data) {
			console.log(data);
		}).on('error', function(err) {
			console.error(err);
			done();
		});
	});

};
