module.exports = function (grunt) {

  /**
   * Configuration.
   */

  grunt.initConfig({
    uglify: {
      default: {
        options: {
          preserveComments: 'some',
          sourceMap: 'angular-draganddrop.min.map',
          sourceMappingURL: 'angular-draganddrop.min.map'
        },
        files: {
          'angular-draganddrop.min.js': 'angular-draganddrop.js'
        }
      }
    }
  });

  /**
   * Tasks.
   */

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify']);
};