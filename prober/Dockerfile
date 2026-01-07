# Use the official Golang image
FROM golang:1.21-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the go.mod and go.sum from the prober directory
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the prober source code
COPY . .

# Build the application
RUN go build -o main .

# Expose the port Railway provides
EXPOSE 8080

# Run the binary
CMD ["./main"]