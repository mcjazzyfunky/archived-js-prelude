module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: ["build/*", "dist/v<%= pkg.version %>"],
            }
        },
        babel: {
            options: {
                //modules: 'common',
                retainLines: true,
                moduleIds: false,
                sourceMap: true,
                presets: ['es2015']
                //optional: ['runtime']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js'],
                    dest: 'build/src',
                    ext: '.js'
                },
                {
                    expand: true,
                    cwd: 'specs',
                    src: ['**/*.js'],
                    dest: 'build/specs',
                    ext: '.js'
                }]
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: [
                        //'node_modules/grunt-babel/node_modules/babel-core/node_modules/regenerator/runtime.js'
                        'node_modules/babel-polyfill/dist/polyfill.min.js'
                    ],
                    bail: true
                },
                src: ['build/specs/**/*.js']
            }
        },
        esdoc : {
            dist : {
                options: {
                    source: 'src/module/',
                    destination: 'dist/v<%= pkg.version %>/docs/api',
                    //autoPrivate: false,
                    title: 'mojo.js',
                    test: {
                        type: 'mocha',
                        source: './specs',
                        includes: ['\\Spec.js']
                    }
                }
            }
        },
        browserify: {
            js: {
                //extend: true,
                //src: ['build/src/**/*.js'],
                src: 'build/src/mojo.js',
                dest: 'dist/v<%= pkg.version %>/mojo-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                ASCIIOnly: true,
                banner: '/*\n'
                        + ' <%= pkg.name %> v<%= pkg.version %> -'
                        + ' <%= grunt.template.today("yyyy-mm-dd") %>\n'
                        + ' Homepage: <%= pkg.homepage %>\n'
                        + ' License: <%= pkg.license %>\n'
                        + '*/\n'
            },
            js: {
                src: ['dist/v<%= pkg.version %>/mojo-<%= pkg.version %>.js'],
                dest: 'dist/v<%= pkg.version %>/mojo-<%= pkg.version %>.js'
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                files: [{
                    src: ['dist/v<%= pkg.version %>/mojo-<%= pkg.version %>.js'],
                    dest: 'dist/v<%= pkg.version %>/mojo-<%= pkg.version %>.js.gz'
                }, {
                    src: ['dist/v<%= pkg.version %>/polyfill.min.js'],
                    dest: 'dist/v<%= pkg.version %>/polyfill.min.js.gz'
                }]
            }
        },
        copy: {
            dist: {
                src: 'node_modules/babel-polyfill/dist/polyfill.min.js',
                dest: 'dist/v<%= pkg.version %>/polyfill.min.js'
            }
        },
        watch: {
            js: {
                options: {
                    spawn: true,
                },
                files: ['src/**/*.js', 'specs/**/*.js'],
                 tasks: ['compile', 'mochaTest']
                //tasks: ['esdoc']
            }
        }
    });

    // TODO: This is not really working :-(
    // On watch events, if the changed file is a test file then configure mochaTest to only
    // run the tests from that file. Otherwise run all the tests
    grunt.event.on('watch', function (action, filePath) {
        if (filePath.match('^src/')) {
            grunt.config.set(['mochaTest', 'test', 'src'], 'build/specs/**/*.js');
        } else if (filePath.match('^specs/')) {
            grunt.config.set(['mochaTest', 'test', 'src'], 'build/' + filePath);
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-esdoc');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('compile', ['babel']);
    grunt.registerTask('test', ['babel', 'mochaTest']);
    grunt.registerTask('doc', ['babel', "mochaTest", 'esdoc']);
    grunt.registerTask('dist', ['clean', "babel", "mochaTest", 'esdoc', 'browserify', 'uglify', 'copy', 'compress']);
    grunt.registerTask('default', ['dist']);
};
