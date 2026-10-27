#!/bin/sh
set -eu
awslocal sqs create-queue --queue-name phase0-dlq
cat > /tmp/attributes.json <<'EOF'
{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:phase0-dlq\",\"maxReceiveCount\":\"3\"}"}
EOF
awslocal sqs create-queue --queue-name phase0 --attributes file:///tmp/attributes.json
touch /tmp/phase0-ready
