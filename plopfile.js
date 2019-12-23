module.exports = function(plop) {
  plop.setGenerator('tspackage', {
    description: 'Typescript package',

    // inquirer prompts
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Package name? (without scope)',
      },
    ],

    actions: function(data) {
      const actions = [
        {
          type: 'addMany',
          destination: 'packages/{{name}}',
          base: 'plop-templates/tspackage',
          templateFiles: 'plop-templates/tspackage/**/*',
          globOptions: {
            dot: true,
          },
        },
      ]
      return actions
    },
  })
}
