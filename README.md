# create README.md for all Docker images
This action will check if a container image needs and update.

## Inputs

### `image`

Image to check

### `latest`

Latest version found

### YML example 
```yml
- name: get latest version and last tag
  run: |
    LATEST_VERSION=$(curl -s https://go.dev/dl/?mode=json | jq -r '.[0].version' | sed 's|go||')
    LATEST_TAG=$(git describe --abbrev=0 --tags `git rev-list --tags --max-count=1` | sed 's|v||')
    echo "WORKFLOW_UPDATE_BASE64JSON=$(echo '{"version":"'${LATEST_VERSION}'", "tag":"'${LATEST_TAG}'"}' | base64 -w 0)" >> "${GITHUB_ENV}"
    echo "LATEST_VERSION=${LATEST_VERSION}" >> "${GITHUB_ENV}"

- name: check if updated is needed
  if: env.LATEST_VERSION != 'null' && env.LATEST_VERSION != ''
  uses: 11notes/action-org-update@v1
  with:
    image: '11notes/go'
    latest: ${{ env.LATEST_VERSION }}

- name: call org.update
  if: env.ORG_UPDATE == 'true'
  uses: the-actions-org/workflow-dispatch@3133c5d135c7dbe4be4f9793872b6ef331b53bc7
  with:
    wait-for-completion: false
    workflow: org.update.yml
    token: "${{ secrets.REPOSITORY_TOKEN }}"
    inputs: '{ "etc":"${{ env.WORKFLOW_UPDATE_BASE64JSON }}" }'
```