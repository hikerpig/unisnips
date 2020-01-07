echo "Cloning LICENSE to unisnips packages"
ls -db ./packages/*/ | grep -v '.*packages\/(babel-parser|babel-plugin-transform-object-assign)\/?$' | xargs -n 1 cp LICENSE
