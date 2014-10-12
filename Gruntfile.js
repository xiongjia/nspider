'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      options: { jshintrc: '.jshintrc' },
      gruntfile: { src: 'Gruntfile.js' },
      config: { src: ['lib/**/*.js'] }
    }
  });

  /* load plugins */
  grunt.loadNpmTasks('grunt-contrib-jshint');

  /* alias */
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['test']);
};

