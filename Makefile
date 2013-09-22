CLOSURE=java -jar compiler.jar
OUTPUT=things.min.js
COMPILATION_LEVEL=--compilation_level SIMPLE_OPTIMIZATIONS
SOURCES=things.js boilerplate.js
OPTIMIZATIONS=$(COMPILATION_LEVEL) --use_types_for_optimization

all: $(SOURCES) minify

minify: $(SOURCES)
	$(CLOSURE) --js $(SOURCES) --js_output_file $(OUTPUT) $(OPTIMIZATIONS)
