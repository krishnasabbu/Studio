// src/handlers/jiraHandler.ts
import { useCallback } from 'react';
import { AddBotMessage, UpdateBotMessage } from '../types'; // Import both types

export const useJiraHandler = () => {
    return useCallback(
        async (content: string, insertBotMessage: AddBotMessage, updateBotMessage: UpdateBotMessage) => {
            const jiraIdMatch = content.match(/\b([A-Z]{2,}-\d+)\b/);
            if (!jiraIdMatch) {
                insertBotMessage("🔍 Please provide a valid Jira ID like `PROJ-123`.");
                return;
            }
            const jiraId = jiraIdMatch[0];

            // 1. Insert a "loading" message and get its ID
            const loadingMsgId = insertBotMessage(`✅ Jira ID '${jiraId}' detected. Fetching issue details...`);

            try {
                const jiraRes = await fetch('/api/jira/fetch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jiraId }),
                }).then((res) => res.json());

                if (!jiraRes.success) {
                    // Update the loading message to an error state
                    updateBotMessage(loadingMsgId, `❌ Failed to fetch Jira: ${jiraRes.message}`);
                    return;
                }

                // 2. Update the message with the next step
                updateBotMessage(loadingMsgId, "📄 Description retrieved. Analyzing with AI...");
                const description = jiraRes.data.description;
                
                // You can add more progress updates here
                // Example:
                const llmMsgId = insertBotMessage("🧠 Analyzing with AI...");

                const llmRes = await fetch('/api/llm/detect-tools', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description }),
                }).then((res) => res.json());

                const tools = llmRes?.data?.tools || [];
                if (tools.length === 0) {
                    updateBotMessage(llmMsgId, "🧠 No tools required. Task complete.");
                    return;
                }

                updateBotMessage(llmMsgId, `🛠️ Detected tools: ${tools.join(', ')}. Executing...`);

                for (const tool of tools) {
                    // 3. For each tool, insert a new loading message
                    const toolMsgId = insertBotMessage(`⚙️ Running ${tool}...`);
                    const toolRes = await fetch(`/api/tool/${tool.toLowerCase()}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jiraId, description }),
                    }).then((res) => res.json());

                    if (toolRes.success) {
                        updateBotMessage(toolMsgId, `✅ ${tool} completed.`);
                    } else {
                        updateBotMessage(toolMsgId, `❌ ${tool} failed: ${toolRes.message}`);
                    }
                }

                insertBotMessage("🎉 Jira task processing completed!");

            } catch (error: any) {
                // Update the main loading message to a final error state
                updateBotMessage(loadingMsgId, `⚠️ System error: ${error.message}`);
            }
        },
        []
    );
};
