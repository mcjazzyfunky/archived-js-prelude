/*global mojoToolkitMeta: true */

mojoToolkitMeta = {
    packages: [
        {
            name: 'mojo.base',
            jsFiles: [
                'Exception.js',
                'IllegalArgumentException.js',
                'IllegalOperationException.js',
                'NoSuchElementException.js',
                'NotImplementedException.js',
                'StopIterationException.js'
            ]
        },
        {
            name: 'mojo.util',
            jsFiles: [
                'ArrayUtils.js',
                'Config.js',
                'ConfigException.js',
                'DomUtils.js',
                'HtmlBuilder.js',
                'ObjectUtils.js',
                'Seq.js',
                'StringUtils.js',
                'TypeUtils.js'
            ]
        },
        {
            name: 'mojo.react',
            jsFiles: [
                'Behavior.js',
                'EventStream.js',
                'Timer.js'
            ]
        },
        {
            name: 'mojo.ui',
            jsFiles: [
                'Widget.js',
                'Button.js',
                'TextField.js'
            ]
        }
    ]
};
